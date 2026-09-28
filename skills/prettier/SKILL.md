---
name: prettier
description: Apply Prettier conventions for deterministic frontend formatting when Prettier is present.
---

# Prettier Adapter

## Activate when

Activate only when Prettier config/package/scripts are detected.

## Repository inspection

Inspect config, overrides, ignore file, workspace packages and generated-file boundaries.

## Decision rules

Treat Prettier as formatting only; do not use it to replace semantic linting.

## Implementation contract

file scope → Prettier config → deterministic output → format check.

## Failure handling

Handle config discovery and generated-file exclusions before mass formatting.

## Review

Keep formatting-only changes separate from behavior changes.

## Verification

Run repository format check/write command and inspect the diff.
