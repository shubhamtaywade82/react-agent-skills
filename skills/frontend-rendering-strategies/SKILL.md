---
name: frontend-rendering-strategies
description: Choose and verify CSR, SSR, SSG, ISR, streaming, selective hydration and partial-prerendering strategies from actual framework/runtime evidence.
---

# Frontend Rendering Strategies

## Activate when

Activate when a task changes server/client rendering, caching, hydration, route rendering, streaming, static generation or prerendering.

## Repository inspection

Inspect framework version/config, route metadata, server entry, data fetching, caching, build output and deployment runtime.

## Decision rules

Select rendering per route/data requirement rather than globally. Distinguish HTML generation from data freshness and cache policy.

SSR/streaming changes require hydration and waterfall verification. Static/prerendered routes require explicit invalidation/rebuild semantics.

## Implementation contract

Document:

render mode → data source → cache/revalidation → hydration/client code → invalidation

Do not move privileged server work into the client merely to simplify rendering.

## Failure handling

Watch for hydration mismatches, waterfalls, cache leaks between users, stale content and server-only modules entering client output.

## Review

Check HTML correctness, personalization, caching, revalidation, streaming boundaries, client bundle and error handling.

## Verification

Run build output inspection plus route-level integration/browser tests for affected rendering modes.
