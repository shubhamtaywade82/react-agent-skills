---
name: astro-react
description: Apply Astro + React integration conventions for islands, hydration directives and client boundaries when present.
---

# Astro React Adapter

## Activate when

Activate only when Astro and React integration configuration are detected.

## Repository inspection

Inspect Astro routes, React islands, client hydration directives, content/data loading and build output.

## Decision rules

Keep non-interactive content static when possible. Hydrate only the island that needs client behavior.

## Implementation contract

Astro route → React island → hydration directive → client state/data.

## Failure handling

Handle incorrect hydration timing, browser-only APIs in server-rendered modules and duplicate data fetching.

## Review

Check island boundaries, accessibility and generated client bundle.

## Verification

Run Astro build and representative browser tests.
