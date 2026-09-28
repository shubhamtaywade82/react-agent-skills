---
name: rspack
description: Apply Rspack conventions for module graph, loaders/plugins, code splitting and production optimization when Rspack is present.
---

# Rspack Adapter

## Activate when

Activate only when Rspack configuration/dependencies are detected.

## Repository inspection

Inspect config, aliases, loaders, plugins, splitChunks and target environments.

## Decision rules

Preserve the repository module/asset conventions. Avoid webpack plugins not confirmed compatible.

## Implementation contract

source graph → transforms → chunks/assets → runtime.

## Failure handling

Handle loader/plugin mismatches, duplicate runtime dependencies and client/server target confusion.

## Review

Check source maps, bundle boundaries and environment handling.

## Verification

Run Rspack build plus affected tests and inspect emitted assets when behavior depends on bundling.
