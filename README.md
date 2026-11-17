# Agent Context Research

Install the Core working rules as always-on user instructions, then install this domain context and its skills in the current project. Core is installed from its npm dependency and remains the single source for global rules.

Default installation for Codex:

    npx @ai-agent-context/agent-context-research --target codex

This installs the Core managed block into ~/.codex/AGENTS.md, RESEARCH_CONTEXT.md in the current project, and skills under .agents/skills. Re-running updates only the Core managed block and preserves other user instructions. Existing project context and skill files are never overwritten.

Choose a different agent for Core instructions:

    npx @ai-agent-context/agent-context-research --agent claude-code --target portable
    npx @ai-agent-context/agent-context-research --agent copilot-cli --target portable
    npx @ai-agent-context/agent-context-research --agent gemini-cli --target portable

The --agent option selects the always-on Core instructions destination. The --target option selects the skill destination: codex installs under .agents/skills; portable installs under skills/ for manual discovery. Domain context remains in the current project for the agent to load when that domain applies.

Installing @ai-agent-context/agent-context-core by itself configures only the shared Core rules and installs no domain context or skills.
