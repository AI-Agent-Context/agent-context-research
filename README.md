# Agent Context Research

Install the shared Core context, research context, and research skills into the current project.

## Install

Run from the root of the project where you want the files:

    npx @ai-agent-context/agent-context-research

npm installs Core as a dependency, so you do not need to install Core separately. The command copies:

- `GLOBAL_WORKING_CONTEXT.md` from Core into the project root.
- `RESEARCH_CONTEXT.md` into the project root.
- The included skills into `.agents/skills/<skill-name>/`.

Requires Node.js `^18.17.0` or `>=20.5.0`. The installer does not change agent-wide settings or load context automatically.

## Included skills

The package installs all of these skills:

| Skill | What it does |
|---|---|
| `convert-paper-pdf` | Converts research paper PDFs into Markdown and extracts embedded figures. |
| `literature-review` | Surveys academic literature, compares methods, and identifies research gaps. |

## Load context for a session

At the start of each session, load or attach `GLOBAL_WORKING_CONTEXT.md`. For academic research work, also load `RESEARCH_CONTEXT.md` and use the relevant research skills from `.agents/skills/`.

## Portable skills directory

To put skills under `skills/` instead of `.agents/skills/`, run:

    npx @ai-agent-context/agent-context-research --target portable

The context files remain in the project root.

## Existing files

The installer never overwrites project files or skill directories. It reuses `GLOBAL_WORKING_CONTEXT.md` only when the existing file is identical to Core's copy. A different Global Working Context, an existing `RESEARCH_CONTEXT.md`, or a directory already present for one of the included skills stops the installation; resolve the conflict before retrying.

## Install only Core

To copy only the shared Global Working Context, run:

    npx @ai-agent-context/agent-context-core

This does not install `RESEARCH_CONTEXT.md` or research skills.
