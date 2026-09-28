---
name: github-pages
description: Apply GitHub Pages conventions for static frontend base paths, SPA fallback, asset URLs and deployment workflows when present.
---

# GitHub Pages Adapter

## Activate when

Activate only when GitHub Pages deployment is configured.

## Repository inspection

Inspect workflow, base URL/public path, static output and routing strategy.

## Decision rules

Treat repository subpaths as part of the public URL contract. Do not assume root hosting.

## Implementation contract

build → base-path-aware assets → static output → Pages deployment → client navigation fallback.

## Failure handling

Handle 404 on deep links, incorrect asset base paths and deployment branch drift.

## Review

Check links, asset URLs and route fallback behavior.

## Verification

Run static build and a deployed-path smoke test where available.
