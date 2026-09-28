---
name: zod
description: Apply Zod conventions for runtime schemas, inferred TypeScript types and validation boundaries when Zod is present.
---

# Zod Adapter

## Activate when

Activate only when Zod is a repository dependency.

## Repository inspection

Inspect schema ownership, transforms/refinements, inferred types and boundary usage.

## Decision rules

Use schemas at untrusted input boundaries. Do not treat inferred TypeScript types alone as runtime validation.

## Implementation contract

unknown input → schema parse/safeParse → validated domain/transport data.

## Failure handling

Keep validation errors structured enough for UI/API mapping; avoid unsafe transformations.

## Review

Check coercion, optionality, transforms, unknown keys and error exposure.

## Verification

Run schema tests plus affected boundary tests.
