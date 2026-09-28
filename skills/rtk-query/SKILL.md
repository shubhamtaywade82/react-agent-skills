---
name: rtk-query
description: Apply Redux Toolkit Query conventions for endpoint definitions, tags, cache lifetime and generated hooks when RTK Query is present.
---

# RTK Query Adapter

## Activate when

Activate only when RTK Query endpoints and Api slices are present.

## Repository inspection

Inspect API slice, endpoint injection, tag types, serialization and store integration.

## Decision rules

Keep server state in RTK Query. Use tags and endpoint lifecycle intentionally instead of duplicating cache state in slices.

## Implementation contract

Define endpoint → transform/validation → cache tags → UI hook. Mutations must invalidate or update the precise affected tags/data.

## Failure handling

Watch for duplicate API slices, unstable query args, missing tags and auth refresh loops.

## Review

Check API slice ownership, tag invalidation, response typing and store middleware.

## Verification

Run endpoint tests, store integration tests and typecheck/build.
