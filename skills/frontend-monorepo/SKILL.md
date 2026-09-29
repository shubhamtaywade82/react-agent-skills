---
name: frontend-monorepo
description: Manage React/TypeScript monorepos with explicit package boundaries, dependency graphs, task pipelines, caching and affected verification.
---

# Frontend Monorepo

## Activate when

Activate when workspace configuration, multiple frontend packages/apps, pnpm/npm/yarn workspaces, Turborepo, Nx or similar build graphs are present.

## Repository inspection

Inspect workspace manifests, package graph, task runner, lockfile, tsconfig references, shared configs, package exports, build/test/lint scripts and CI affected-project logic.

## Decision rules

Treat the workspace as a graph, not a single application. Respect package ownership and declared dependencies. Prefer affected verification for scoped changes, then run shared-boundary checks for packages consumed by affected applications.

Do not create cross-package imports through source paths when a package contract exists.

## Implementation contract

Preserve: dependency direction → package API → build graph → task cache → test scope.

Shared configuration changes are high blast-radius because they can alter every package.

## Failure handling

Watch for phantom dependencies, undeclared transitive imports, duplicate React/TypeScript versions, cache-key omissions and workspace-local scripts that differ from CI.

## Review

Check dependency edges, package exports, peer dependencies, lockfile, task graph and affected-project calculation.

## Verification

Run the workspace's graph-aware lint/typecheck/test/build commands and validate both the changed package and at least one representative consumer when applicable.


## Progressive disclosure

Read `references/package-boundaries.md` for package-boundary changes. Run `node scripts/check-package-boundaries.mjs <repo-root>` when validating workspace package names and `workspace:` dependencies.
