---
name: styled-components
description: Apply styled-components conventions for theme ownership, prop filtering, SSR style extraction and component styling when present.
---

# styled-components Adapter

## Activate when

Activate only when styled-components and its runtime/configuration are detected.

## Repository inspection

Inspect ThemeProvider, style sheet SSR handling, transient props and Babel/SWC integration.

## Decision rules

Use the existing theme contract and avoid leaking styling-only props into DOM elements.

## Implementation contract

theme → styled boundary → filtered props → rendered DOM → SSR/CSR parity.

## Failure handling

Watch for hydration mismatches, style ordering and invalid DOM attributes.

## Review

Check theming, SSR extraction, accessibility states and bundle/runtime configuration.

## Verification

Run SSR/hydration tests where relevant plus component/browser tests.
