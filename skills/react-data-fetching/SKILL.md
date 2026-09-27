---
name: react-data-fetching
description: Use when implementing HTTP APIs, queries, mutations, caching, invalidation, optimistic updates, and asynchronous server state.
---

# React Data Fetching

## Purpose
Treat server state as a lifecycle: loading, success, empty, stale, error, cancellation, and mutation states.

## Activate when
- consuming an API;
- adding query/mutation behavior;
- fixing cache invalidation or stale-response bugs.

## Repository inspection
Inspect API clients, query/cache library, fetch conventions, auth/session handling, retry rules, cache keys, cancellation, and runtime validation.

## Decision rules
- Keep HTTP mechanics out of presentational components when a data boundary exists.
- Cache keys must contain every resource identity dimension.
- Cancel or ignore superseded requests where ordering can race.
- Retries must respect operation idempotency.
- Validate external responses before domain use.
- Optimistic updates require rollback or reconciliation.

## Implementation procedure
1. Define request/response contract.
2. Validate runtime data at the boundary.
3. Define cache identity/freshness.
4. Model loading/empty/error/success.
5. Define mutation consistency and recovery.
6. Test cancellation and invalidation.

## Anti-patterns / failure modes
- fetch duplicated across components;
- stale responses overwriting newer state;
- incomplete cache keys;
- optimistic updates without recovery.

## Agent review checklist
- Is server state separate from UI state?
- What makes two responses equivalent?
- What happens after navigation?
- How is cache consistency restored?

## Verification
Test initial load, empty, error, cancellation, refetch, cache hit, invalidation, and mutation failure/success.
