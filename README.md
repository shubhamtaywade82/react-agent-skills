# React Agent Skills

Production-grade **React + TypeScript engineering skills for AI coding agents**, packaged for progressive disclosure and evidence-gated routing.

This repository turns React/TypeScript knowledge into executable guidance an agent can use to inspect a repository, route to the right expertise, implement a bounded change, verify behavior, and report evidence.

## Coverage

### React engineering
- architecture and feature boundaries
- component API design and composition
- hooks, effects, refs, and synchronization
- state ownership and client-state design
- server-state/data fetching and cache behavior
- forms, validation, submission, and recovery
- routing and URL contracts
- testing and integration boundaries
- accessibility and keyboard/focus behavior
- performance, profiling, code splitting, and virtualization
- security and browser trust boundaries
- error resilience and recovery UX
- design systems and shared UI primitives
- build/toolchain/CI concerns
- observability and privacy-aware telemetry
- review and pre-merge engineering checks

### TypeScript engineering
- language/compiler discipline
- type and domain modeling
- runtime contracts for untrusted data
- async error/cancellation modeling
- public API and module boundary design
- typed API contracts and compatibility
- compiler configuration and incremental migration

## Agent operating loop

    Task
      ↓
    Inspect agent capabilities + repository archetype
      ↓
    Classify change risk
      ↓
    Route primary skill + real secondary constraints
      ↓
    Model contract + failure states
      ↓
    Implement smallest coherent slice
      ↓
    Typecheck + test + lint + build
      ↓
    Review security/accessibility/performance/scope
      ↓
    Report observed evidence

## Inventory

The current expansion contains 127 registered skills, 60 reusable patterns, 110 evaluation contracts, and 102 benchmark cases, including 8 fixture-backed executable scenarios.

## Installation

Use the included installer or expose AGENTS.md plus the skill pack to the coding agent's skill/context mechanism.

    bash bin/install --target ~/.local/share/agent-skills/react-agent-skills

See [Agent integration](docs/AGENT_INTEGRATION.md) for repository-local and custom-agent setup.

See [Coverage matrix](docs/COVERAGE_MATRIX.md) for domain, adapter, security, production, and evaluation coverage.

The pack is framework-aware rather than framework-dependent. The agent must resolve whether the target uses Vite, Next.js, Remix, React Router, or another runtime before applying framework-specific assumptions.

## Routing

The standard skill surface is each `skills/<name>/SKILL.md` and its `name`/`description` frontmatter. Native Agent Skills hosts should discover and activate skills from that metadata first. `skill-manifest.yml`, `router/ROUTING.md`, and `router/ROUTING_POLICY.yml` are compatibility, validation, and deterministic local-routing metadata rather than required model context.

Choose one primary skill based on the dominant boundary, then compose only the secondary skills that add real constraints. Framework, library, deployment and observability adapters are evidence-gated.

## Context efficiency

This pack follows the Agent Skills progressive-disclosure model: concise `SKILL.md` entrypoints, skill-local `references/` for detailed material, and `scripts/` for deterministic repeatable checks. Agents should not preload the whole pack.

The repository includes contract tests that enforce description limits, shallow/resolvable references, precise routing metadata, deterministic resource presence, and native skill-discovery quality. See [skill discovery evaluation](docs/SKILL_DISCOVERY_EVALUATION.md) for the methodology and limits.


## Validation

Run:

    node --test test/*.test.mjs
    node scripts/validate.mjs
    node scripts/validate-benchmarks.mjs
    node scripts/validate-fixtures.mjs
    node scripts/skill-discovery-evaluator.mjs --check

GitHub Actions runs these structural, benchmark, and installer checks on pushes and pull requests. CI also builds the Agensi marketplace bundles (complete and starter) and uploads them as a `agensi-bundles` artifact on every green run; see `packaging/PUBLISHING.md` for how to promote an artifact to a marketplace listing.

## Marketplace distribution

The canonical source remains this GitHub repository under the MIT License. A curated, tested Agensi marketplace bundle is published alongside the open-source release for buyers who want a packaged, validated, installable archive.

- Complete bundle: `scripts/build-bundle.mjs --output dist/` — every skill, pattern, evaluation, and benchmark, plus the contract tests, validators, and installer.
- Starter bundle (free): `scripts/build-starter-bundle.mjs --output dist/` — a strict subset for discovery and evaluation; see `packaging/STARTER_SKILLS.yml`.

MIT already permits redistribution and resale, so the paid bundle adds curation, packaging, validation, and maintenance — not exclusivity. See:

- `packaging/MARKETPLACE_LISTING.md` — the marketplace listing copy.
- `packaging/LICENSE_ADDENDUM.md` — the license interaction between MIT and Agensi's terms.
- `packaging/PUBLISHING.md` — the end-to-end publishing workflow.
- `packaging/STARTER_SKILLS.yml` — the curated free starter set.
- `packaging/BUNDLE_VERSION.txt` — the bundle version (bumped per release).

The bundle contract test (`test/bundle-contract.test.mjs`) enforces that both bundles are byte-identical to the canonical source and that the starter bundle is a strict subset of the complete bundle.

## Non-negotiables

- Do not invent requirements.
- Do not weaken TypeScript strictness globally to hide local uncertainty.
- Do not treat TypeScript types as runtime validation.
- Do not put business policy into generic presentational components.
- Do not use effects to duplicate values that can be derived during render.
- Do not treat client-side visibility as authorization.
- Do not introduce memoization/virtualization without evidence.
- Do not publish secrets or sensitive data in examples.
- Do not claim tests, builds, benchmarks, or CI passed unless they actually ran.

## Primary references

- React: https://react.dev/learn
- React API Reference: https://react.dev/reference/react
- React + TypeScript: https://react.dev/learn/typescript
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/intro.html
- TSConfig: https://www.typescriptlang.org/tsconfig/
- Testing Library: https://testing-library.com/docs/
- WAI-ARIA Authoring Practices: https://www.w3.org/WAI/aria/apg/
- Vite: https://vite.dev/guide/
- MDN Web APIs: https://developer.mozilla.org/

## Scope

This is engineering guidance for coding agents. It does not replace product requirements, security review, framework-specific documentation, or repository inspection.

## Full-stack: Rails + React and Node + React

This pack is the frontend half. Backend skills are not copied here; install the backend pack next to it:

| Backend | Install with this pack | Seam skill |
| --- | --- | --- |
| Ruby on Rails | [ruby-agent-skills](https://github.com/shubhamtaywade82/ruby-agent-skills) | `rails-react-integration` |
| Node.js + TypeScript | [node-agent-skills](https://github.com/shubhamtaywade82/node-agent-skills) | `node-react-integration` |

```bash
npx skills add shubhamtaywade82/react-agent-skills -a claude-code
npx skills add shubhamtaywade82/node-agent-skills -a claude-code      # Node backend
# Rails backend: run `bash bin/install --agent claude` in a ruby-agent-skills checkout, before this pack
```

Routing, ownership per concern, and current skill-name collisions with ruby-agent-skills are in [Full-stack composition](docs/FULLSTACK_COMPOSITION.md).

## Split architecture

The planned split from `ruby-agent-skills` is documented in:

- [Skill taxonomy](docs/TAXONOMY.md)
- [Source inventory](docs/SOURCE_INVENTORY.md)
- [Migration plan](docs/MIGRATION_PLAN.md)
- [Migration map](docs/MIGRATION_MAP.yml)
- [Full-stack composition](docs/FULLSTACK_COMPOSITION.md)
- [Agent integration](docs/AGENT_INTEGRATION.md)
- [Benchmark schema](docs/BENCHMARK_SCHEMA.md)
- [Benchmark runner](docs/BENCHMARK_RUNNER.md)
