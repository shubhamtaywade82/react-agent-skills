---
name: frontend-architecture
description: Establish browser-application module boundaries, dependency direction, feature ownership, and composition rules.
---

## Activate when
Use when reorganizing a frontend, introducing feature modules, reducing coupling, or defining shared versus feature-local code.

## Repository inspection
Inspect source layout, import graph, route boundaries, state ownership, API clients, UI primitives, dependency cycles, package boundaries, and existing architectural conventions.

## Decision framework
Organize around stable domain or user capabilities rather than arbitrary technical folders when repository evidence supports it. Keep dependencies flowing from reusable primitives toward feature composition, not the reverse.

## Implementation
- Define explicit ownership for pages, features, components, data access, and shared utilities.
- Keep feature-specific policy out of generic UI primitives.
- Prefer composition over deep inheritance.
- Keep cross-feature dependencies narrow and intentional.
- Introduce a boundary only when it reduces a real coupling or lifecycle problem.

## Failure modes
Avoid giant utils modules, god components, global stores as escape hatches, circular feature dependencies, and abstractions created before a second concrete use case exists.

## Review
Check dependency direction, state ownership, public module surfaces, test boundaries, and migration scope.

## Verification
Use import/build checks and focused tests to prove behavior survives structural changes. Inspect dependency graphs when tooling exists.
