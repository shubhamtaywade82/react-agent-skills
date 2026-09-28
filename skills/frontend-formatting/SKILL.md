---
name: frontend-formatting
description: Detect and enforce the repository's formatting contract without mixing formatter policy into semantic lint rules.
---

# Frontend Formatting

## Activate when

Activate when formatting differs across files, CI detects format drift, or the repository evaluates Prettier/Biome/editor formatting behavior.

## Repository inspection

Inspect package scripts, formatter configs, editor settings, generated-file rules, workspace config and existing formatting conventions.

## Decision rules

Use one authoritative formatter contract per file class. Prefer an existing repository formatter before adding one. Treat Prettier and Biome as conditional adapters unless repository evidence confirms them.

Formatting should not silently rewrite generated files or unrelated packages.

## Implementation contract

Define file ownership, config discovery, generated-file exclusions and the CI command. Keep formatting deterministic and independent of editor-specific settings.

## Failure handling

Check line endings, config discovery, ignored/generated files and multiple formatter conflicts before accepting mass reformatting.

## Review

Review diff size and semantic churn. Formatting changes should not obscure behavior changes.

## Verification

Run the formatter check and inspect the final diff for unrelated changes.
