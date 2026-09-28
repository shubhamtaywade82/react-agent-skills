---
name: tailwindcss
description: Apply Tailwind CSS conventions for utility composition, tokens, responsive states and build behavior when Tailwind is present.
---

# Tailwind CSS Adapter

## Activate when

Activate only when Tailwind configuration/dependencies and utility classes are detected.

## Repository inspection

Inspect Tailwind version/config, content sources, theme/tokens, plugins, class composition utilities and generated CSS strategy.

## Decision rules

Use repository tokens and utility conventions. Avoid dynamic class construction that the configured content scanner cannot discover.

## Implementation contract

Design token/state variants → compose utilities → preserve responsive/focus/motion states → verify generated CSS.

## Failure handling

Watch for missing classes in production builds, conflicting utility order and unsafe dynamic interpolation.

## Review

Check responsive, focus, dark-mode and reduced-motion variants plus bundle size.

## Verification

Run CSS build and affected component/browser tests.
