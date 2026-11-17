#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { getGlobalInstructionDestination, installGlobalContext, supportedAgents } from '@ai-agent-context/agent-context-core/installer';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const npmRequire = createRequire(import.meta.url);
const domainContextName = 'RESEARCH_CONTEXT.md';

function lstatOrNull(file) {
  try {
    return fs.lstatSync(file);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function regularFile(file) {
  const stat = lstatOrNull(file);
  if (!stat || stat.isSymbolicLink() || !stat.isFile()) {
    throw new Error('Expected a regular packaged file: ' + file);
  }
  return stat;
}

function walkFiles(directory, relative = '') {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    const stat = fs.lstatSync(fullPath);
    if (stat.isSymbolicLink()) throw new Error('Packaged sources cannot contain symbolic links: ' + fullPath);
    const childRelative = path.join(relative, entry.name);
    if (stat.isDirectory()) {
      files.push(...walkFiles(fullPath, childRelative));
    } else if (stat.isFile()) {
      files.push({ source: fullPath, relative: childRelative });
    } else {
      throw new Error('Unsupported packaged source type: ' + fullPath);
    }
  }
  return files;
}

function getContextFiles() {
  const source = path.join(packageRoot, domainContextName);
  regularFile(source);
  return [{ name: domainContextName, source }];
}

function getGlobalContextSource() {
  let source;
  try {
    source = npmRequire.resolve('@ai-agent-context/agent-context-core/GLOBAL_WORKING_CONTEXT.md');
  } catch {
    throw new Error('Required dependency @ai-agent-context/agent-context-core is unavailable. Install this package with Core 0.2.0 or newer.');
  }
  regularFile(source);
  return source;
}

function getSkills() {
  const root = path.join(packageRoot, 'skills');
  const stat = lstatOrNull(root);
  if (!stat) return [];
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error('Skills root must be a regular directory: ' + root);
  const groups = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^[a-zA-Z0-9_-]+$/.test(entry.name)) {
      throw new Error('Invalid skill directory: ' + entry.name);
    }
    const skillDirectory = path.join(root, entry.name);
    const files = walkFiles(skillDirectory);
    if (!files.some(file => file.relative === 'SKILL.md')) {
      throw new Error('Skill is missing SKILL.md: ' + entry.name);
    }
    groups.push({ name: entry.name, files });
  }
  return groups;
}

function ensureSafeDirectoryPath(directory, cwd) {
  const relative = path.relative(cwd, directory);
  if (relative.startsWith('..' + path.sep) || relative === '..' || path.isAbsolute(relative)) {
    throw new Error('Destination escapes the current project: ' + directory);
  }
  let current = cwd;
  for (const part of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    const stat = lstatOrNull(current);
    if (stat && (stat.isSymbolicLink() || !stat.isDirectory())) {
      throw new Error('Destination path must contain only regular directories: ' + current);
    }
  }
}

function parseArguments(args) {
  let agent = 'codex';
  let target = 'codex';
  const seen = new Set();
  if (args.length % 2 !== 0) throw new Error('Each option requires a value.');
  for (let index = 0; index < args.length; index += 2) {
    const option = args[index];
    const value = args[index + 1];
    if (!['--agent', '--target'].includes(option) || seen.has(option) || !value || value.startsWith('-')) {
      throw new Error('Invalid or repeated option, or missing value near "' + option + '".');
    }
    seen.add(option);
    if (option === '--agent') {
      if (!supportedAgents.includes(value)) {
        throw new Error('Unsupported agent "' + value + '". Choose one of: ' + supportedAgents.join(', ') + '.');
      }
      agent = value;
    } else {
      if (!['codex', 'portable'].includes(value)) {
        throw new Error('Use --target codex or --target portable for skills.');
      }
      target = value;
    }
  }
  return { agent, target };
}

function main(args = process.argv.slice(2)) {
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) {
    console.log('Usage: <package-command> [--agent codex|claude-code|copilot-cli|gemini-cli] [--target codex|portable]');
    console.log('Installs Core as always-on user instructions and this domain context plus skills in the current project.');
    console.log('The default agent is Codex. --target controls the skill directory only.');
    return 0;
  }

  const { agent, target } = parseArguments(args);
  const cwd = process.cwd();
  const contextFiles = getContextFiles();
  const globalContextSource = getGlobalContextSource();
  const skills = getSkills();
  const skillsDestinationRoot = path.resolve(cwd, ...(target === 'codex' ? ['.agents', 'skills'] : ['skills']));
  ensureSafeDirectoryPath(skillsDestinationRoot, cwd);

  const plan = [];
  for (const context of contextFiles) {
    const destination = path.join(cwd, context.name);
    if (lstatOrNull(destination)) {
      throw new Error('Destination already exists; will not overwrite: ' + destination);
    }
    plan.push({ source: context.source, destination, label: context.name });
  }

  for (const skill of skills) {
    const destination = path.join(skillsDestinationRoot, skill.name);
    if (lstatOrNull(destination)) {
      throw new Error('Skill destination already exists; will not overwrite: ' + destination);
    }
  }

  for (const skill of skills) {
    for (const file of skill.files) {
      const destination = path.resolve(skillsDestinationRoot, skill.name, file.relative);
      const relative = path.relative(skillsDestinationRoot, destination);
      if (relative.startsWith('..' + path.sep) || relative === '..' || path.isAbsolute(relative)) {
        throw new Error('Skill source escapes destination: ' + file.relative);
      }
      plan.push({ source: file.source, destination, label: skill.name + '/' + file.relative });
    }
  }

  const globalDestination = getGlobalInstructionDestination(agent);
  console.log('Installing Core Global Working Context for ' + agent + ', ' + contextFiles.map(context => context.name).join(', ') + ', and ' + skills.length + ' skill(s):');
  console.log('  GLOBAL_WORKING_CONTEXT.md -> ' + globalDestination);
  for (const item of plan) console.log('  ' + item.label + ' -> ' + item.destination);

  const installed = [];
  try {
    const globalResult = installGlobalContext({ agent, source: globalContextSource });
    if (globalResult.changed) installed.push(globalResult.destination);
    for (const item of plan) {
      fs.mkdirSync(path.dirname(item.destination), { recursive: true });
      fs.copyFileSync(item.source, item.destination, fs.constants.COPYFILE_EXCL);
      installed.push(item.destination);
    }
  } catch (error) {
    console.error('Error: ' + error.message);
    if (installed.length) console.error('Partial install; inspect these files before retrying:\n' + installed.join('\n'));
    else console.error('No package files were installed.');
    return 1;
  }
  console.log('Installation complete.');
  return 0;
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error('Error: ' + error.message);
    console.error('No package files were installed.');
    process.exitCode = 1;
  }
}
