---
name: frontend-dependency-management
description: Evaluate, add, upgrade, remove, and constrain frontend dependencies with explicit technical and operational justification.
---

## Activate when
Use when modifying package dependencies, lockfiles, build plugins, UI libraries, polyfills, or third-party runtime code.

## Repository inspection
Inspect package manager, lockfile, workspace layout, duplicate packages, bundle impact, peer dependencies, license and security policy, and existing platform alternatives.

## Decision framework
Prefer an existing dependency or browser and React primitive when it satisfies the requirement. Add a dependency only when its capability, maintenance profile, and lifecycle cost are justified.

## Implementation
- Keep dependency scope minimal.
- Pin through the repository's normal lockfile strategy.
- Respect peer and dependency constraints.
- Remove obsolete transitive paths when safe.
- Record migration notes for behaviorally significant upgrades.

## Failure modes
Avoid replacing working primitives for convenience, duplicating libraries that solve the same problem, ignoring peer conflicts, or merging unrelated lockfile churn.

## Review
Check package surface, bundle and runtime cost, security posture, maintenance activity, and compatibility with supported environments.

## Verification
Run the package manager install or check, typecheck, tests, lint, and build. Inspect bundle or dependency reports when runtime weight is affected.
