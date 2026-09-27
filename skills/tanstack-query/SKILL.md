---
name: tanstack-query
description: Apply TanStack Query conventions for server state, query keys, cache lifecycle, mutations, invalidation, and optimistic updates only when detected.
---

## Activate when
Activate only when TanStack Query packages/configuration are present.

## Repository inspection
Inspect QueryClient setup, query key factories, stale/gc settings, mutation defaults, persistence, hydration, retries, and existing invalidation conventions.

## Decision framework
Treat query keys as resource identity. Keep server state in the query cache rather than duplicating it into UI stores.

## Implementation
- Include every identity-defining variable in query keys.
- Keep invalidation targeted.
- Model optimistic writes with rollback and reconciliation.
- Respect mutation idempotency and server ordering.

## Failure modes
Watch for partial keys, over-invalidating entire caches, optimistic state without rollback, duplicate clients, and accidental cache persistence of sensitive data.

## Review
Check cache identity, lifecycle, retry behavior, and mutation semantics.

## Verification
Run query-focused tests for cache hits/misses, invalidation, optimistic failure, retries, and concurrent mutations.
