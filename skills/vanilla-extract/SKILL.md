---
name: vanilla-extract
description: Apply vanilla-extract conventions for static CSS generation, typed tokens, variants and build integration when present.
---

# vanilla-extract Adapter

## Activate when

Activate only when vanilla-extract packages/configuration are present.

## Repository inspection

Inspect theme contracts, recipes/variants, generated CSS and bundler plugin.

## Decision rules

Keep styles statically analyzable. Prefer typed tokens and explicit variants.

## Implementation contract

typed styles/tokens → build extraction → generated CSS → component.

## Failure handling

Handle plugin/config mismatches and generated CSS drift.

## Review

Check token ownership, responsive/focus states and generated output.

## Verification

Run configured build and component/browser tests.
