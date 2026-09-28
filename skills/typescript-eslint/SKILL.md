---
name: typescript-eslint
description: Apply typescript-eslint with typed linting and Project Service only where type information improves defect detection.
---

# typescript-eslint

## Activate when

Activate when a repository uses TypeScript-aware ESLint rules, migrates typescript-eslint versions, or needs type-checked linting.

## Repository inspection

Inspect ESLint flat config, typescript-eslint version, tsconfig/project graph, parser options, workspace boundaries, generated code and lint scripts.

## Decision rules

Use type-aware linting for rules that materially depend on TypeScript semantics. Prefer projectService for modern workspace-aware typed linting when supported by the repository. Avoid broad parser projects that include tests/generated/out-of-tree files unnecessarily.

Do not enable every type-aware rule by default. Cost and signal quality matter.

## Implementation contract

Keep parser, compiler and package versions compatible. Ensure every linted file belongs to a resolvable TypeScript project or is intentionally excluded. Use separate typed/untyped lint scopes when that reduces startup cost without lowering required correctness checks.

## Failure handling

Distinguish missing type configuration from actual lint violations. Watch for monorepo tsconfig discovery, generated files, project references and editor/CI differences.

## Review

Check rule signal, runtime cost, project-service boundaries, parser/compiler alignment and ignore behavior.

## Verification

Run lint on representative application, library and test files, then the repository-standard lint command in CI-equivalent configuration.
