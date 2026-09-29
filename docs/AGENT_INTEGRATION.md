# Agent Integration

This repository is a skill library, not a standalone coding agent. The agent must provide filesystem, terminal, Git, package-manager, compiler/test, browser, and repository inspection capabilities.

## Repository-local usage

Keep the repository available to the coding agent and expose:
- AGENTS.md
- skill-manifest.yml
- router/ROUTING.md
- skills/
- patterns/
- evaluations/
- benchmarks/

When the host supports the Agent Skills standard, let native discovery use `SKILL.md` frontmatter (`name` + `description`) first. The agent should load one primary skill plus only the secondary skills required by actual repository evidence.

## Install from GitHub

Clone the repository and run:

    bash bin/install --target ~/.local/share/agent-skills/react-agent-skills

Or choose an agent-specific directory:

    bash bin/install --target /path/to/your/agent/skills/react-agent-skills

The installer copies the full skill pack atomically into the target directory.

## Runtime inspection contract

Before implementation, an agent should inspect:
1. package manager and lockfile
2. Node and TypeScript versions
3. React version
4. framework/runtime and build tool
5. scripts for typecheck/lint/test/build
6. test and E2E configuration
7. source/module layout
8. environment/configuration handling
9. security-sensitive boundaries
10. CI requirements

## Progressive disclosure

Do not load the complete skill pack into the model context. Activate a skill from its description, then read `references/<file>.md` only when the relevant condition applies. Use a skill-local `scripts/<file>` utility when a deterministic check is available.

Reference links must remain relative to the skill root and one level deep.

## Conditional skills

Do not load all framework adapters by default. Activate Vite, Next.js, Remix, React Router, TanStack Query, Redux, Zustand, Vitest, Testing Library, Playwright, Cypress, Storybook, or MSW guidance only after dependency/config/source evidence confirms the tool is actually used.

## Routing discipline

Prefer a strong intent match over a shared generic keyword. For ambiguous tasks, inspect the repository before loading framework/library adapters. Keep security, accessibility and testing as targeted secondary constraints rather than parallel broad skills.

## Full-stack repositories

For Rails + React repositories, compose this pack with ruby-agent-skills. Backend ownership remains in the Ruby pack; frontend ownership remains here; cross-boundary behavior is proved through the shared integration contract.
