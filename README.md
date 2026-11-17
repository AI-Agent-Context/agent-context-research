# Agent Context Research

Install the universal context, Research context, and all included skills into the current project. This package works by itself; the Core package is optional.

Command: `npx @ai-agent-context/agent-context-research --target codex`

The package includes `GLOBAL_WORKING_CONTEXT.md`, `RESEARCH_CONTEXT.md`, and all Research skills. If an identical Global context already exists, the installer reuses it; a different existing context is left untouched and causes an error.

Use `--target portable` to install skills under `skills/` instead of `.agents/skills`. The installer copies complete skill directories and supporting files.
