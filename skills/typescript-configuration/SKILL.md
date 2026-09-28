---
name: typescript-configuration
description: Engineer tsconfig and TypeScript compiler configuration changes as explicit compatibility and build contracts.
---

## Activate when
Use when changing tsconfig files, compiler flags, module resolution, JSX settings, declarations, project references, or strictness.

## Repository inspection
Inspect all tsconfig variants, extends chains, project references, build tool transforms, test config, package module format, and CI typecheck commands.

## Decision framework
Change the narrowest config that owns the required behavior. Do not weaken strictness globally to hide local errors.

## Implementation
- Document why non-default compiler options are required.
- Keep editor and build configuration aligned.
- Consider emitted JavaScript semantics, not only typechecking.
- Validate project references and declaration boundaries when present.

## Failure modes
Watch for dev/build divergence, hidden strictness regressions, module-resolution mismatch, and declaration output changes.

## Review
Compare effective configuration across dev, test, and production paths.

## Verification
Run repository typecheck, build, declaration generation if applicable, and affected test suites.

## Build-graph composition

For project references, composite projects, incremental builds and declaration boundaries, compose with `typescript-build-architecture`. Keep compiler configuration focused on options while build ownership remains explicit.
