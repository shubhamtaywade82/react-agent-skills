# Monorepo Package Boundaries

Use this reference when changing package structure, workspace dependencies or shared configuration.

## Boundary rules

1. Each workspace package has one clear owner and a stable package name.
2. Internal consumers use the published/package contract, not source-path traversal.
3. Internal dependencies are declared explicitly.
4. Shared configs are treated as high-blast-radius changes.
5. React and TypeScript peer/runtime versions remain intentional across packages.

## Verification

For an affected package:

- inspect the dependency graph;
- validate package exports;
- check internal `workspace:` dependency names;
- run the package's focused typecheck/test/build;
- verify at least one representative consumer when the package is consumed elsewhere.

## Cache safety

Task caches must include inputs that affect generated output, compiler behavior, environment-sensitive build steps and dependency resolution. A cache hit is not a substitute for correctness verification.
