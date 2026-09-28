---
name: apollo
description: Apply Apollo Client conventions for GraphQL cache identity, queries, mutations, fragments and normalization when Apollo is present.
---

# Apollo Adapter

## Activate when

Activate only when Apollo Client/server packages and repository usage are detected.

## Repository inspection

Inspect Apollo version, client setup, cache policies, fragments, generated types, SSR integration and existing query/mutation conventions.

## Decision rules

Respect the configured cache identity and field policies. Prefer fragments and typed operations that match the repository schema. Do not introduce a second GraphQL client.

## Implementation contract

Keep schema → generated types → operation → cache → UI boundaries consistent. Mutations must define invalidation/refetch/update semantics explicitly.

## Failure handling

Handle stale normalized entities, cache key mistakes, SSR cache leakage and schema/type drift.

## Review

Check cache identity, query variables, generated types, authorization boundaries and server/client cache isolation.

## Verification

Run GraphQL/type generation, focused operation tests, relevant integration tests and the repository build.
