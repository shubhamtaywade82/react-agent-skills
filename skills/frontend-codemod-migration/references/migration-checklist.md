# Codemod Migration Checklist

Use this reference for framework, library or syntax migrations.

## Before transform

- Record baseline typecheck, tests and build.
- Identify supported target versions and breaking changes.
- Bound the package/file scope.
- Prefer an AST-aware transform.

## Execute

1. Dry-run or preview the transform.
2. Apply to the smallest representative package.
3. Inspect the semantic diff.
4. Typecheck and run focused tests.
5. Expand only after the representative slice is correct.

## Safety properties

Prefer idempotent transforms. Preserve comments and formatting where practical. Exclude generated and vendored files unless they are explicitly part of the migration.

## Exit criteria

The final tree has no unsupported API remnants, typecheck/build/test results are green, generated artifacts are regenerated from their source, and the migration can be rolled back in coherent commits.
