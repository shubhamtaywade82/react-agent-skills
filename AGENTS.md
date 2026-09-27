# React + TypeScript Agent Engineering Contract

This repository is an agent-executable React + TypeScript engineering skill library. Treat skills, routing, validation, references, and CI as one system.

## Operating sequence

1. Discover applicable skills from \`skill-manifest.yml\`.
2. Inspect React/TypeScript/framework versions, package manager, scripts, source layout, tests, linting, build, and existing conventions.
3. Resolve ambiguity before implementation; do not invent product behavior.
4. Select one primary skill and only the secondary skills required by real boundaries.
5. Preserve public contracts unless the task explicitly changes them.
6. For behavior changes, add or update focused tests at the owning boundary.
7. Implement the smallest coherent change.
8. Run focused verification, then repository-standard typecheck/lint/test/build commands.
9. Review security, accessibility, performance, resilience, and scope.
10. Simplify accidental complexity.
11. Report observed evidence only; never claim an unrun command passed.

## React rules

- Prefer React primitives and repository patterns before adding abstractions.
- Keep component APIs explicit and small.
- Treat effects as synchronization with external systems, not as a general place for derived state.
- Separate local UI state, server state, URL state, and durable application state.
- Prefer render-time derivation over duplicated derived state.
- Use stable keys based on identity.
- Prefer semantic HTML before custom accessibility behavior.
- Make async cancellation, stale-response handling, and error states explicit.
- Measure before broad memoization or virtualization.

## TypeScript rules

- Use \`unknown\` at untrusted runtime boundaries.
- Prefer discriminated unions over flag combinations that permit invalid states.
- Keep exported contracts explicit.
- Minimize assertions and isolate unavoidable \`any\`.
- Do not mistake TypeScript declarations for runtime validation.
- Separate transport, domain, and UI types when their invariants differ.

## Security rules

- Treat browser input, URL data, storage, API responses, and third-party content as untrusted.
- Never ship server secrets in client-delivered code.
- Require a documented sanitization boundary for HTML rendering.
- Encode URL/query/path values.
- Treat authentication and authorization as separate controls.

## Dependency rules

Before adding a dependency, inspect existing dependencies and platform primitives, compare maintenance/security/runtime cost, and document why the dependency earns its place.

## Skill-pack maintenance

Every skill must have a valid \`SKILL.md\`, be registered in \`skill-manifest.yml\`, and contain activation, inspection, decision, implementation, failure, review, and verification guidance. Keep validation and CI green.
