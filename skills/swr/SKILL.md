---
name: swr
description: Apply SWR conventions for cache keys, revalidation, mutation, deduplication and stale data behavior when SWR is present.
---

# SWR Adapter

## Activate when

Activate only when SWR is installed and used for server state.

## Repository inspection

Inspect fetcher, key factories, cache provider, revalidation options and mutation patterns.

## Decision rules

Treat the key as the server-state identity. Keep fetcher response validation separate from cache configuration. Do not create local state for data already owned by SWR.

## Implementation contract

Define key → fetcher → validation → cache/revalidation → UI lifecycle. Mutation updates must specify optimistic, rollback and revalidation behavior.

## Failure handling

Handle focus revalidation, stale responses, mutation races and cache-provider isolation.

## Review

Check stable keys, error/loading contracts, retry behavior and cache scope.

## Verification

Run focused query/mutation tests and application integration checks.
