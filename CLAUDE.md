# CLAUDE.md — Claude Code orientation for react-agent-skills

This file is the **Claude Code entry point** for the `react-agent-skills` skill pack. Claude Code reads `CLAUDE.md` first when entering a repository; this file tells Claude Code where the canonical contract lives and how to use this pack alongside its companions.

## What this repository is

`react-agent-skills` is a portable skill pack of agent-executable React + TypeScript engineering knowledge. It is **not a runnable application** — it has no React entry point, no dev server, no UI build. It is consumed by AI coding assistants (Claude Code first; also Cursor, Codex, Continue, Aider) via the `skills/<name>/SKILL.md` Agent Skills convention.

The pack ships **129 skills** + frontend patterns + evaluation cases + contract tests, organized so an agent can classify a task, inspect a React repository, select skills, implement a bounded change, verify behavior, and report evidence.

## Read these before making non-trivial changes

In this order:

1. **`AGENTS.md`** (repo root) — the canonical engineering contract: domain change contracts, operating sequence, context rules, routing quality, React/TypeScript/security/dependency rules, verification contract, skill precedence, backend companion packs, installation, evaluation and benchmark rules, CI toolchain, release readiness, repository completeness. **Everything in `AGENTS.md` is binding for any agent working in this pack.**
2. **`skill-manifest.yml`** — the routing registry and the `cross_pack:` seam contracts (companion packs, pinned refs, seam skills).
3. **`router/ROUTING.md`** — the routing guide; especially "Backend companion packs" (Rails and Node.js seams) and "Anti-collision rule".
4. **`docs/FULLSTACK_COMPOSITION.md`** — how to compose this pack with `ruby-agent-skills` / `node-agent-skills` in a full-stack repository.
5. **`framework-drift.yml`** — removed/deprecated React and TypeScript APIs that skill code fences must not recommend.

## Skill content standard (binding for any change)

Every skill lives at `skills/<name>/SKILL.md` with valid YAML frontmatter (`name` matching the directory, `description` 1–1024 characters and intent-specific), is registered in `skill-manifest.yml` with non-generic triggers, and contains activation, inspection, decision, implementation, failure, review, and verification guidance. Keep each skill below 500 lines; move deep knowledge into skill-local `references/` one level deep. `test/skill-efficiency-contract.test.mjs` enforces the inventory and metadata constraints.

## Runtime files (Claude Code may invoke these)

- `bin/install` — bash installer for the pack (bundles and local checkouts).
- `scripts/validate.mjs` — canonical validator; run it before calling any change done.
- `scripts/build-bundle.mjs` / `scripts/build-starter-bundle.mjs` — Agensi marketplace bundles; byte-identical to canonical source (enforced by `test/bundle-contract.test.mjs`).

## Tests

`npm test` (`node --test test/*.test.mjs`) runs the contract test suite. CI (GitHub Actions, Node 22) runs the same suite plus the bundle builders. Never merge with a red suite; never weaken a test to make a run green.

## Cross-pack integration (binding)

Backend work belongs to a backend pack: Rails to `ruby-agent-skills`, Node.js to `node-agent-skills`. This pack never copies backend skills. The seams are symmetric:

- Rails backend → this pack's `react-rails-integration` (client) ↔ `ruby-agent-skills`'s `rails-react-integration` (server).
- Node.js backend → this pack's `react-node-integration` (client) ↔ `node-agent-skills`'s `node-react-integration` (server).

When the backend pack is not installed, finish the client work and report the backend follow-up and the owning backend skill. Do not improvise server guidance.

## Commit discipline

Keep commits scoped to one contract surface (skills, routing, evaluations, packaging, or docs). Update `CHANGELOG.md` under `## Unreleased` in the same commit that changes behavior. Run `npm test` and `npm run validate` before pushing.

## What this pack is NOT

- It is not a component library, a starter template, or a runnable app.
- It does not own backend behavior (Rails/Node servers, databases, jobs).
- It does not duplicate backend-pack skills; name collisions are resolved per `skill-manifest.yml` `cross_pack.name_collisions` and `docs/FULLSTACK_COMPOSITION.md`.

## See also

- `README.md` — inventory and usage.
- `docs/AGENT_INTEGRATION.md`, `docs/AGENT_OPERATING_MODEL.md` — agent operating layers.
- `docs/PROMOTION_METADATA.md`, `docs/RELEASE_PROMOTION.md`, `docs/FINAL_RELEASE_CHECKLIST.md` — release process.
- Companion packs: `ruby-agent-skills`, `node-agent-skills`.
