---
name: biome
description: Apply Biome conventions for formatting and linting when Biome is the repository's configured toolchain.
---

# Biome Adapter

## Activate when

Activate only when Biome configuration/scripts are present.

## Repository inspection

Inspect biome.json, package scripts, formatter/linter domains and generated-file exclusions.

## Decision rules

Use Biome as the authoritative formatter/linter only for scopes configured by the repository. Do not run competing formatters across the same files.

## Implementation contract

config → scoped format/lint → deterministic output → CI check.

## Failure handling

Separate formatting changes from rule violations and do not rewrite unrelated packages.

## Review

Check rule scope, import sorting, formatting and generated files.

## Verification

Run repository-standard Biome checks and inspect the diff.
