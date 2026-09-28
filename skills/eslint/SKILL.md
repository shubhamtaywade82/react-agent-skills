---
name: eslint
description: Configure and migrate ESLint with flat config, scoped rules, ignores and repository-specific execution boundaries.
---

# ESLint

## Activate when

Activate for ESLint configuration, lint failures, flat-config migration, lint performance, plugin compatibility, ignore behavior or lint-rule architecture.

## Repository inspection

Inspect ESLint version, config files, package type, workspace topology, plugins, shared configs, scripts, generated-file directories and CI commands.

## Decision rules

For ESLint 10-era repositories, use flat configuration and do not reintroduce eslintrc compatibility merely to avoid migration. Keep ignores and file globs explicit. Scope expensive rules to relevant files.

Use existing framework/compiler plugins before adding alternatives.

## Implementation contract

Define config layering: base semantics → TypeScript rules → React/framework rules → test rules → generated-file boundaries.

Keep configuration deterministic across editor and CI. Document intentional rule overrides with the boundary they protect.

## Failure handling

Diagnose config loading, plugin compatibility, parser/project resolution, ignore mismatches and workspace path issues separately from source lint errors.

## Review

Check flat-config usage, plugin versions, duplicate configs, generated-file ignores, test-file rules, TypeScript-aware rules and CI/editor parity.

## Verification

Run the repository lint script, focused file lint, configuration debug/print where available, and the full CI lint command.
