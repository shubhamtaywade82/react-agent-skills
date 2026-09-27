---
name: typescript-migration
description: Execute incremental TypeScript migrations with compatibility boundaries, strictness preservation, and measurable cleanup.
---

## Activate when
Use when converting JavaScript to TypeScript, upgrading TypeScript, tightening strictness, replacing legacy types, or migrating module systems.

## Repository inspection
Measure baseline type errors, compiler configuration, JS allow-check settings, generated code, test coverage, and high-risk runtime boundaries.

## Decision framework
Prefer bounded vertical slices over repository-wide rewrites. Preserve runtime behavior first, then improve type precision.

## Implementation
- Establish a baseline and track remaining debt explicitly.
- Avoid mass any-casts or suppression comments.
- Convert boundary types to unknown plus runtime validation where needed.
- Keep migration commits reviewable and reversible.
- Remove temporary compatibility shims as each slice stabilizes.

## Failure modes
Watch for silent behavior changes, type-only fixes that leave runtime bugs, declaration drift, and permanent suppression debt.

## Review
Check runtime equivalence, type strictness trend, scope, and removal of temporary scaffolding.

## Verification
Run typecheck, tests, lint, build, and migration-specific metrics or error counts where available.
