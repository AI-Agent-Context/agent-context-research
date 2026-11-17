# Agent Context Research

Install the Research context and skills. npm also installs Core as a dependency, so Global Working Context stays sourced from the Core package.

Command: `npx @ai-agent-context/agent-context-research --target codex`

This command installs GLOBAL_WORKING_CONTEXT.md from Core, RESEARCH_CONTEXT.md, and all Research skills. If an identical Global context already exists, it is reused; a different existing file is left untouched and causes an error.

Running `npx @ai-agent-context/agent-context-core` by itself installs only Global Working Context.

Use `--target portable` to install skills under `skills/` instead of `.agents/skills`. The installer copies complete skill directories and supporting files.
