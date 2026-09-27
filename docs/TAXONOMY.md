# React + TypeScript Skill Taxonomy

## Status

Design baseline for the split from \`ruby-agent-skills\`.

Source inventory audited at commit \`3ce8a2bbfef174d83c161ff7399d47742289c4e6\`.

## Architectural goal

This pack owns browser/frontend engineering that can be used from Rails, Node, Next.js, Vite, Remix, or standalone React applications.

It must remain:
- framework-aware but framework-neutral at the core;
- modular enough for selective agent context loading;
- explicit about ownership boundaries;
- extensible through conditional tool-specific skills;
- independently versionable from \`ruby-agent-skills\`.

## Core versus conditional skills

Core skills describe durable engineering principles and React/TypeScript behavior.

Conditional skills describe a concrete framework/library/tool and activate only when repository inspection proves that tool is present or requested.

\`\`\`text
React + TypeScript Core
        |
        +-- TypeScript
        +-- React
        +-- Frontend platform/architecture
        +-- Security
        +-- Testing
        +-- Production
        |
        +-- Conditional adapters
             +-- Vite / Next.js / Remix
             +-- React Router
             +-- TanStack Query
             +-- Redux / Zustand
             +-- Vitest / Testing Library / Playwright / Cypress
             +-- Storybook / MSW / styling systems
\`\`\`

## Target taxonomy

### A. Agent/meta

| Skill | Responsibility |
| --- | --- |
| \`agent-workflow\` | Inspect → route → implement → verify → report |
| \`react-review\` | Cross-cutting frontend review and pre-merge verification |

These are process skills, not React framework knowledge.

### B. TypeScript engineering

| Skill | Responsibility |
| --- | --- |
| \`typescript-core-engineering\` | Language semantics, compiler, narrowing, generics, modules |
| \`typescript-type-design\` | Domain types, unions, brands, generics, invariants |
| \`typescript-runtime-contracts\` | Unknown/untrusted data and runtime validation |
| \`typescript-async-error-modeling\` | Typed async outcomes, cancellation, error normalization |
| \`typescript-public-api-design\` | Exported module/package contracts and compatibility |
| \`typescript-api-contracts\` | Transport/domain contract ownership, generated types, schema/version evolution |

Ownership rule: compile-time modeling belongs here; runtime validation belongs in \`typescript-runtime-contracts\`.

### C. React engineering

| Skill | Responsibility |
| --- | --- |
| \`react-architecture\` | React-specific component hierarchy, feature boundaries, ownership |
| \`react-component-engineering\` | Component APIs, composition, controlled/uncontrolled contracts |
| \`react-hooks-effects\` | Hooks, effects, refs, synchronization, dependency correctness |
| \`react-state-management\` | Local state, reducers, context, client-state stores |
| \`react-data-fetching\` | Queries, mutations, server state, cache, invalidation |
| \`react-forms-validation\` | Forms, field state, validation, submission, server errors |
| \`react-routing\` | URL/navigation contracts, route params, guards |
| \`react-async-ui\` | Loading, refreshing, empty, error, cancellation, optimistic UX state |
| \`react-error-resilience\` | Error boundaries, retry, degradation, recovery UX |
| \`react-accessibility\` | Semantics, keyboard, focus, ARIA, accessible interaction |
| \`react-performance\` | Render cost, memoization, virtualization, profiling |
| \`react-testing-engineering\` | Component/hook/integration testing and deterministic UI tests |
| \`frontend-e2e\` | Browser-level critical-flow and cross-boundary verification |

### D. Frontend architecture/platform

| Skill | Responsibility |
| --- | --- |
| \`frontend-architecture\` | Application-wide frontend module boundaries and dependency direction |
| \`frontend-browser-platform\` | DOM, events, storage, URL APIs, observers, workers, browser lifecycle |
| \`frontend-styling-layout\` | CSS/layout/responsive behavior and styling architecture |
| \`react-design-system\` | Shared UI primitives, tokens, variants, themes |
| \`frontend-environment-configuration\` | Build-time/runtime configuration and environment boundaries |
| \`frontend-dependency-management\` | Dependency selection, upgrades, duplication and supply-chain hygiene |
| \`react-toolchain\` | Build, TypeScript configuration, linting, bundling, CI |
| \`react-observability\` | Client telemetry, errors, metrics, tracing, privacy-aware diagnostics |
| \`frontend-production\` | CDN/cache behavior, asset delivery, deployment verification, source maps, runtime configuration |

Ownership rule: \`react-architecture\` explains React composition/ownership; \`frontend-architecture\` explains application/module/platform boundaries beyond React.

### E. Frontend security

| Skill | Responsibility |
| --- | --- |
| \`frontend-security\` | Threat modeling, trust boundaries, authorization assumptions, dependency risk |
| \`browser-security-dom-safety\` | XSS, HTML sinks, DOM safety, CSP/Trusted Types, third-party scripts |
| \`auth-session-boundaries\` | Cookies/tokens, CSRF, authentication state, session lifecycle |
 
These must not collapse into one vague security skill. Browser sink safety, session mechanics, and application security architecture have different owners.

### F. Conditional ecosystem skills

Create these only when the repository/tool is actually used:

| Conditional skill | Activation evidence |
| --- | --- |
| \`vite\` | Vite config/package dependency |
| \`nextjs\` | Next.js dependency/config/app or pages router |
| \`remix\` | Remix dependency/config |
| \`react-router\` | React Router dependency/config |
| \`tanstack-query\` | TanStack Query dependency and query patterns |
| \`redux\` | Redux Toolkit/Redux dependency |
| \`zustand\` | Zustand dependency |
| \`vitest\` | Vitest configuration/dependency |
| \`testing-library\` | Testing Library dependency/config |
| \`playwright\` | Playwright configuration/dependency |
| \`cypress\` | Cypress configuration/dependency |
| \`storybook\` | Storybook configuration/dependency |
| \`msw\` | MSW configuration/dependency |
| \`styling-system-* \` | Repository-specific CSS/styling framework when its semantics matter |

Conditional skills must refine core principles, never replace them.

## Current-to-target skill lineage

| Source \`ruby-agent-skills\` | Target \`react-agent-skills\` | Action |
| --- | --- | --- |
| \`typescript-core-engineering\` | same | migrate |
| \`typescript-type-design\` | same | migrate |
| \`typescript-runtime-contracts\` | same | migrate |
| \`react-component-engineering\` | same | migrate |
| \`react-state-effects\` | \`react-hooks-effects\` + \`react-state-management\` | split |
| \`react-data-fetching\` | same | migrate |
| \`react-testing-engineering\` | same + later \`frontend-e2e\` | migrate then extend |
| \`react-accessibility-performance\` | \`react-accessibility\` + \`react-performance\` | split |
| \`react-architecture\` | same | migrate |

The two splits are deliberate. A single skill should not simultaneously own unrelated state/effect semantics or accessibility/performance evidence.

## Pattern ownership

The source contains **24 canonical \`patterns/react-typescript\` patterns**:

### React patterns (18)
- \`react-accessible-interaction\`
- \`react-async-ui-state\`
- \`react-component-boundary\`
- \`react-composition-over-boolean-props\`
- \`react-context-scope\`
- \`react-controlled-input\`
- \`react-effect-synchronization\`
- \`react-focus-management\`
- \`react-hook-dependency\`
- \`react-memoization-evidence-gate\`
- \`react-network-mock-boundary\`
- \`react-optimistic-rollback\`
- \`react-query-key-cache\`
- \`react-reducer-state-machine\`
- \`react-render-performance-budget\`
- \`react-server-state-boundary\`
- \`react-state-ownership\`
- \`react-user-interaction-test\`

### TypeScript patterns (6)
- \`typescript-async-error-normalization\`
- \`typescript-branded-identifier\`
- \`typescript-discriminated-union\`
- \`typescript-generic-result\`
- \`typescript-public-api-boundary\`
- \`typescript-runtime-schema-boundary\`

The four React/TypeScript-specific patterns under the cross-cutting \`stack-minimality\` family are **not counted in this 24-pattern migration unit**. They should be handled separately as cross-cutting minimality adaptations rather than silently duplicated.

## Pattern-to-skill mapping

| Pattern family | Owning target skill |
| --- | --- |
| component boundary / composition / controlled input | \`react-component-engineering\` |
| context / state ownership / reducer | \`react-state-management\` |
| effect / hook dependency | \`react-hooks-effects\` |
| async UI / server state / query cache / optimistic rollback | \`react-data-fetching\` + \`react-async-ui\` |
| accessibility / focus | \`react-accessibility\` |
| render budget / memoization | \`react-performance\` |
| network mocking / interaction testing | \`react-testing-engineering\` |
| TypeScript union / brand / generic result | \`typescript-type-design\` |
| public API boundary | \`typescript-public-api-design\` |
| runtime schema boundary | \`typescript-runtime-contracts\` |
| async error normalization | \`typescript-async-error-modeling\` |

## Evaluation taxonomy

The source has **9 dedicated React/TypeScript evaluations**:

1. \`typescript-core-engineering\`
2. \`typescript-type-design\`
3. \`typescript-runtime-contracts\`
4. \`react-component-engineering\`
5. \`react-state-effects\`
6. \`react-data-fetching\`
7. \`react-testing-engineering\`
8. \`react-accessibility-performance\`
9. \`react-architecture\`

Migration rule:
- preserve every source evaluation;
- split combined evaluations when the target skill boundary is split;
- add new cases for every new skill before declaring the new taxonomy complete.

Expected split:
- \`react-state-effects\` evaluation → hooks/effects cases + state-management cases;
- \`react-accessibility-performance\` evaluation → accessibility cases + performance cases.

The evaluation contract should retain functional behavior, tests, contract adherence, and scope control as separate dimensions.

## Full-stack composition boundary

For a Rails API + React UI repository:

\`\`\`text
ruby-agent-skills
  ├── Rails API contract
  ├── authentication / authorization
  ├── PostgreSQL
  └── backend tests

react-agent-skills
  ├── TypeScript/domain contracts
  ├── React UI
  ├── browser security
  ├── client/server state
  └── frontend tests/E2E

shared integration contract
  ├── API schema/version
  ├── auth/session boundary
  ├── error envelope
  ├── pagination/filter/sort semantics
  ├── idempotency semantics
  └── observability/correlation
\`\`\`

The integration layer should be represented as composition guidance, not by duplicating Rails skills inside this pack.
