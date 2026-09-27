---
name: typescript-module-design
description: Design TypeScript module boundaries, dependency direction, exports, and composition without accidental cycles or barrel sprawl.
---

## Activate when
Use when reorganizing modules, package boundaries, exports, import graphs, or shared code.

## Repository inspection
Inspect module format, aliases, package exports, workspace boundaries, barrel files, dependency cycles, and lint rules for import direction.

## Decision framework
Prefer narrow public module surfaces. Introduce an aggregation module only when it reduces real coupling and does not create circular dependencies.

## Implementation
- Keep ownership and direction explicit.
- Separate internal helpers from supported exports.
- Avoid convenience barrels that import large graphs or create cycles.
- Use package exports and path aliases consistently with the runtime.

## Failure modes
Watch for hidden cycles, runtime initialization order bugs, accidental public APIs, and editor-only aliases.

## Review
Inspect the actual dependency graph rather than inferring it from folder names.

## Verification
Run typecheck, build, import-boundary linting, and module-focused tests.
