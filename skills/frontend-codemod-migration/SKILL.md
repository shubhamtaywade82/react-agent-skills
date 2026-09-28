---
name: frontend-codemod-migration
description: Execute frontend codemods and large migrations with deterministic transforms, staged rollout, semantic verification and rollback boundaries.
---

# Frontend Codemod Migration

## Activate when

Activate for framework/library upgrades, API renames, large syntax migrations, automated refactors or codemod-based TypeScript/React changes.

## Repository inspection

Inspect target API versions, migration guide, AST transform, package topology, generated code and affected tests.

## Decision rules

A codemod is an accelerator, not proof. Prefer AST-aware transforms over regex for syntax changes. Run codemods on a narrow package set first.

## Implementation contract

Baseline → dry-run/preview → apply → typecheck → focused tests → inspect diff → expand scope.

Keep transforms idempotent where feasible.

## Failure handling

Handle partial transforms, unsupported syntax, comments/format drift, generated files and semantic changes separately.

## Review

Review both transform correctness and the final semantic diff. Remove temporary codemod dependencies if they are not repository tooling.

## Verification

Run the migration verifier, typecheck, tests and repository formatter/lint commands.
