---
name: urql
description: Apply urql conventions for GraphQL exchanges, document caching, request policy and mutation invalidation when urql is present.
---

# urql Adapter

## Activate when

Activate only when urql is a repository dependency and its client/exchange setup is in use.

## Repository inspection

Inspect client/exchanges, request policies, cache layer, persisted documents and generated types.

## Decision rules

Preserve the repository's exchange order and cache policy. Do not mix urql semantics with Apollo cache assumptions.

## Implementation contract

Keep operation → variables → exchange → cache → UI semantics explicit. Model mutation invalidation according to the active cache strategy.

## Failure handling

Watch for stale cache, exchange ordering mistakes, missing auth context and SSR cache isolation failures.

## Review

Check request policy, cache invalidation, generated types and transport middleware.

## Verification

Run operation tests and type generation, then integration/build checks.
