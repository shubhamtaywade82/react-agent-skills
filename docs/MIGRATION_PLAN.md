# React + TypeScript Migration Plan

## Source and destination

Source:
\`shubhamtaywade82/ruby-agent-skills\`

Audited source commit:
\`3ce8a2bbfef174d83c161ff7399d47742289c4e6\`

Destination:
\`shubhamtaywade82/react-agent-skills\`

Current destination baseline:
\`caaea5f7ad9d70f391fb6c52ec7b9a0e75f91ed6\`

## Migration principles

1. Do not delete frontend material from \`ruby-agent-skills\` until the new pack has equivalent coverage and verified evaluations.
2. Do not blindly copy combined skills; preserve their content but split ownership where the new taxonomy requires it.
3. Keep source lineage in a machine-readable migration map.
4. Every migrated skill/pattern/evaluation must remain registered and executable in the destination.
5. Do not change evaluation difficulty simply to make the destination pass.
6. Validate the destination independently before deprecating source material.
7. Deprecation in the Ruby pack is a separate release change from migration into the React pack.

## Phase 0 — taxonomy lock

Status: design phase.

Deliverables:
- \`docs/TAXONOMY.md\`
- \`docs/MIGRATION_PLAN.md\`
- migration source inventory/map
- explicit ownership rules
- core vs conditional skill policy

Exit gate:
- no React/TypeScript source artifact has an ambiguous primary owner.

## Phase 1 — establish the destination baseline

Already started:
- README/agent contract
- manifest
- router
- validator
- CI
- initial React/TypeScript core skills

Next:
- align current destination skill names exactly with the final taxonomy;
- ensure every core skill has consistent activation/inspection/decision/implementation/failure/review/verification sections;
- add documentation for installation and selective loading.

Exit gate:
- structural validator green;
- manifest and routing agree;
- no orphan skill directories.

## Phase 2 — migrate the canonical skill corpus

Migrate the 9 source skills without deleting them from the source pack.

Lineage:
- 7 direct migrations;
- 2 deliberate splits:
  - \`react-state-effects\` → \`react-hooks-effects\` + \`react-state-management\`
  - \`react-accessibility-performance\` → \`react-accessibility\` + \`react-performance\`

For split skills, preserve all source coverage first, then improve wording/ownership only after parity is established.

Exit gate:
- feature/behavior coverage parity is reviewed skill-by-skill;
- no source guidance is lost during the split.

## Phase 3 — migrate the 24 canonical patterns

Migrate all 24 \`patterns/react-typescript\` patterns.

Do not rewrite them during migration except for:
- path/link updates;
- target skill reference updates;
- removal of source-pack-specific assumptions.

Preserve pattern names initially so evaluations and provenance remain easy to compare.

Exit gate:
- 24/24 patterns present;
- each pattern has exactly one primary owner;
- every pattern is referenced by at least one skill or evaluation.

Cross-cutting exception:
The four React/TypeScript patterns under \`stack-minimality\` are a separate decision. First generalize the minimality principle; then decide whether their canonical home becomes this pack or a future shared cross-stack pack.

## Phase 4 — migrate and split evaluations

Migrate the 9 existing evaluation contracts.

Expected destination evaluation set:
- TypeScript core
- TypeScript type design
- TypeScript runtime contracts
- React components
- React state management
- React hooks/effects
- React data fetching
- React testing
- React accessibility
- React performance
- React architecture

This produces more destination evaluations than source because two combined source evaluations split by ownership.

Add regression/system tests for:
- manifest registration;
- route selection;
- skill file structure;
- evaluation registration;
- pattern ownership.

Exit gate:
- every core skill has at least one executable evaluation;
- split skills have independent evidence.

## Phase 5 — add missing core frontend domains

Add, in this order:

1. \`typescript-async-error-modeling\`
2. \`typescript-public-api-design\`
3. \`typescript-api-contracts\`
4. \`react-async-ui\`
5. \`frontend-e2e\`
6. \`frontend-architecture\`
7. \`frontend-browser-platform\`
8. \`frontend-styling-layout\`
9. \`frontend-environment-configuration\`
10. \`frontend-dependency-management\`
11. \`frontend-production\`
12. \`frontend-security\`
13. \`browser-security-dom-safety\`
14. \`auth-session-boundaries\`

Sequence rationale:
- first close TypeScript/React semantic gaps;
- then add browser/platform architecture;
- then add production/security domains;
- tool-specific skills come after the core contracts are stable.

Exit gate:
- every domain in TAXONOMY.md has an owning skill and evaluation plan.

## Phase 6 — add conditional ecosystem adapters

Add framework/library skills only where useful and independently versioned:

- Vite
- Next.js
- Remix
- React Router
- TanStack Query
- Redux Toolkit
- Zustand
- Vitest
- Testing Library
- Playwright
- Cypress
- Storybook
- MSW

Activation must be based on repository evidence. Never load the full adapter set for every React task.

Exit gate:
- adapters refine core guidance instead of duplicating it;
- routing is explicit and deterministic.

## Phase 7 — build the frontend benchmark system

Adapt the Ruby pack's benchmark discipline to the frontend domain rather than copying its backend fixtures.

Required components:
- fixture repository(s);
- evaluator/verifier contract;
- deterministic test execution;
- unit/integration/E2E boundaries;
- controlled baseline versus skills-enabled runs;
- provenance for skill-pack revision, evaluator revision, fixture revision, and agent/model configuration.

Benchmarks must measure behavior and engineering decisions, not merely the number of files generated.

Exit gate:
- benchmark smoke/integrity tests pass;
- evaluation results are reproducible and auditable.

## Phase 8 — full-stack composition

Define composition artifacts without merging repositories.

A full-stack agent should be able to load:

\`\`\`text
agent-workflow
+
ruby-agent-skills routing
+
react-agent-skills routing
+
shared API/auth/error/observability contracts
\`\`\`

The composition layer should cover:
- OpenAPI/JSON schema ownership;
- generated TypeScript type policy;
- backend/frontend error-envelope compatibility;
- authentication/session boundaries;
- pagination/filter/sort contracts;
- idempotency;
- correlation IDs;
- compatibility/version negotiation.

Exit gate:
- a Rails + React fixture can route backend and frontend changes to different packs without duplicate skill loading.

## Phase 9 — deprecate frontend skills in ruby-agent-skills

Only after all prior gates pass:

1. mark the 9 original frontend skills as deprecated in the Ruby pack;
2. add explicit replacement references to \`react-agent-skills\`;
3. keep migration notes for at least one release cycle;
4. keep source evaluations until destination equivalence is verified;
5. remove source frontend artifacts only in a deliberate breaking-release change.

The Ruby pack remains authoritative for Ruby/Rails/PostgreSQL/backend concerns.

## Proposed branch/PR sequence

Use isolated branches so failures never contaminate main:

\`\`\`
react/01-foundation
react/02-skill-migration
react/03-pattern-migration
react/04-evaluation-migration
react/05-core-expansion
react/06-conditional-adapters
react/07-benchmarking
react/08-fullstack-composition
ruby/09-frontend-deprecation
\`\`\`

Merge order is strictly sequential because later phases depend on the routing and ownership contracts established earlier.

## Definition of done

The split is complete only when:

- destination core taxonomy is fully registered;
- migrated skills and patterns have parity with source;
- split skills have independent contracts/evaluations;
- conditional adapters are opt-in by repository evidence;
- frontend benchmarks are independently executable;
- full-stack composition is documented;
- \`ruby-agent-skills\` frontend skills are deprecated only after verified equivalence;
- destination CI is green;
- all claims are backed by executed validation/evaluation evidence.
