---
name: css-modules
description: Apply CSS Modules conventions for local scoping, composition, generated class names and style ownership when present.
---

# CSS Modules Adapter

## Activate when

Activate only when module CSS files and CSS Modules configuration are present.

## Repository inspection

Inspect naming, preprocessing, class composition and generated type support.

## Decision rules

Keep component styles local. Avoid global selectors unless explicitly owned.

## Implementation contract

component → module class → composed/local selectors → generated artifact.

## Failure handling

Watch for specificity leaks, global imports and stale generated style types.

## Review

Check responsive/focus states and class ownership.

## Verification

Run style build and relevant browser/component tests.
