---
name: emotion
description: Apply Emotion conventions for theme/cache configuration, SSR extraction and safe style prop handling when Emotion is present.
---

# Emotion Adapter

## Activate when

Activate only when @emotion packages and repository usage are detected.

## Repository inspection

Inspect cache/key setup, ThemeProvider, SSR integration and styled/css APIs.

## Decision rules

Preserve one cache strategy per rendering root and avoid accidental style duplication.

## Implementation contract

theme/cache → style declaration → DOM output → SSR/CSR hydration.

## Failure handling

Watch for hydration style ordering, duplicate caches and leaked style-only props.

## Review

Check theme contract, accessibility states and SSR integration.

## Verification

Run affected SSR/hydration and component tests.
