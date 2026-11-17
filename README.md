# Agent Context Research

Install this domain context and its skills into the current project. npm installs Core as a dependency, so the shared Global Working Context comes from the Core package.

Run from the root of the project:

    npx @ai-agent-context/agent-context-research

This copies GLOBAL_WORKING_CONTEXT.md from Core, RESEARCH_CONTEXT.md, and all included skills. By default, skills go under .agents/skills. No agent-wide settings are changed. At the start of each session, load or attach GLOBAL_WORKING_CONTEXT.md yourself; load the domain context when that domain applies.

Use --target portable to install skills under skills/ instead of .agents/skills. The installer copies complete skill directories, including supporting files. Existing domain context or skill directories are never overwritten. If an identical Global Working Context already exists, it is reused; a different existing file is left untouched and causes an error.

Running npx @ai-agent-context/agent-context-core by itself installs only the shared Global Working Context. It does not install this domain context or its skills.
