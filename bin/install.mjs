#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contextNames = ['GLOBAL_WORKING_CONTEXT.md', 'CODING_CONTEXT.md', 'RESEARCH_CONTEXT.md'];

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
  const found = contextNames.filter(name => {
    const stat = lstatOrNull(path.join(packageRoot, name));
    if (!stat) return false;
    if (stat.isSymbolicLink() || !stat.isFile()) throw new Error('Context source must be a regular file: ' + name);
    return true;
  });
  const globalContext = 'GLOBAL_WORKING_CONTEXT.md';
  const domainContexts = found.filter(name => name !== globalContext);
  const isCorePackage = found.length === 1 && found[0] === globalContext;
  const isStandaloneDomainPackage = found.length === 2 && found.includes(globalContext) && domainContexts.length === 1;
  if (!isCorePackage && !isStandaloneDomainPackage) {
    throw new Error('Package must contain GLOBAL_WORKING_CONTEXT.md and either only that file or exactly one domain context.');
  }
  return found;
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

function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) {
    console.log('Usage: <package-command> [--target codex|portable]');
    console.log('Installs this package context and all included skills into the current project.');
    console.log('The default target is codex (.agents/skills).');
    return 0;
  }

  let target = 'codex';
  if (args.length > 0) {
    if (args.length !== 2 || args[0] !== '--target' || !['codex', 'portable'].includes(args[1])) {
      console.error('Error: use --target codex or --target portable.');
      return 1;
    }
    target = args[1];
  }

  const cwd = process.cwd();
  const contextFiles = getContextFiles();
  for (const contextFile of contextFiles) regularFile(path.join(packageRoot, contextFile));
  const skills = getSkills();
  const skillsDestinationRoot = path.resolve(cwd, ...(target === 'codex' ? ['.agents', 'skills'] : ['skills']));
  ensureSafeDirectoryPath(skillsDestinationRoot, cwd);

  const plan = [];
  for (const contextFile of contextFiles) {
    const contextSource = path.join(packageRoot, contextFile);
    const contextDestination = path.join(cwd, contextFile);
    const existing = lstatOrNull(contextDestination);
    if (existing) {
      const isIdenticalGlobalContext = contextFile === 'GLOBAL_WORKING_CONTEXT.md'
        && !existing.isSymbolicLink()
        && existing.isFile()
        && fs.readFileSync(contextSource).equals(fs.readFileSync(contextDestination));
      if (isIdenticalGlobalContext) {
        console.log('Reusing identical existing Global Working Context: ' + contextDestination);
        continue;
      }
      throw new Error('Destination already exists; will not overwrite: ' + contextDestination);
    }
    plan.push({ source: contextSource, destination: contextDestination, label: contextFile });
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

  console.log('Installing ' + contextFiles.join(', ') + ' and ' + skills.length + ' skill(s):');
  for (const item of plan) console.log('  ' + item.label + ' -> ' + item.destination);

  const installed = [];
  try {
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

try {
  process.exitCode = main();
} catch (error) {
  console.error('Error: ' + error.message);
  console.error('No package files were installed.');
  process.exitCode = 1;
}
