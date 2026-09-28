---
name: typescript-version-migration
description: Plan and execute TypeScript major-version migrations with explicit compiler, module, dependency and compatibility gates.
---

# TypeScript Version Migration

## Activate when

Activate for TypeScript 5→6, 6→7 preparation, compiler deprecations, breaking diagnostics, module-resolution changes, or TypeScript package upgrades.

## Repository inspection

Inspect the locked TypeScript version, tsconfig inheritance, module/moduleResolution settings, build scripts, project references, declaration output, language-service tooling, ESLint/type-aware linting, test runner and framework constraints.

## Decision rules

Treat compiler upgrades as compatibility work, not dependency-only changes. Read the target release notes and migration guidance. Run the old compiler baseline before changing code so new diagnostics are attributable.

Pay particular attention to deprecated/removed options, module resolution, Node/ESM/CJS boundaries, side-effect import checking, declaration emit and tooling versions.

## Implementation contract

1. Establish baseline typecheck/build/test.
2. Upgrade TypeScript and required peer tooling together.
3. Run compiler diagnostics without broad suppressions.
4. Fix errors in dependency order.
5. Regenerate declarations/generated types where applicable.
6. Run affected tests.
7. Verify package/runtime/build compatibility.
8. Document intentional compatibility exceptions.

Never solve an upgrade by lowering strictness globally.

## Failure handling

Separate source errors from tooling incompatibilities. Check ts-node/tsx, ts-jest, ESLint parser, bundler plugins, IDE versions, test runners and generated code before changing application logic.

## Review

Check tsconfig drift, module semantics, declaration output, package exports, generated artifacts, suppression count and lockfile changes.

## Verification

Compare pre/post typecheck and build evidence. Run tests and package/library validation when the repository publishes TypeScript artifacts.
