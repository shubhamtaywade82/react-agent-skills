# React Agent Skills

Production-grade **React + TypeScript engineering skills for AI coding agents**.

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
    Inspect repository + runtime
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

The current expansion contains 52 registered skills, 60 reusable patterns, 39 core React/TypeScript evaluation contracts, and 31 benchmark cases. Nine audited source skill snapshots are preserved for provenance.

## Installation

Use the included installer or expose AGENTS.md plus the skill pack to the coding agent's skill/context mechanism.

    bash bin/install --target ~/.local/share/agent-skills/react-agent-skills

See [Agent integration](docs/AGENT_INTEGRATION.md) for repository-local and custom-agent setup.

The pack is framework-aware rather than framework-dependent. The agent must resolve whether the target uses Vite, Next.js, Remix, React Router, or another runtime before applying framework-specific assumptions.

## Routing

The canonical inventory is skill-manifest.yml. Routing guidance is in router/ROUTING.md.

Choose one primary skill based on the dominant boundary, then compose only secondary skills that add real constraints.

## Validation

Run:

    node --test test/manifest-contract.test.mjs test/benchmark-contract.test.mjs test/benchmark-runner.test.mjs test/install-contract.test.mjs
    node scripts/validate.mjs
    node scripts/validate-benchmarks.mjs

GitHub Actions runs these structural, benchmark, and installer checks on pushes and pull requests.

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
