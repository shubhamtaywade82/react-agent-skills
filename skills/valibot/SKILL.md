---
name: valibot
description: Apply Valibot conventions for composable runtime validation and inferred TypeScript types when Valibot is present.
---

# Valibot Adapter

## Activate when

Activate only when Valibot is installed and used.

## Repository inspection

Inspect schema modules, parsing APIs, pipelines and inferred types.

## Decision rules

Keep runtime validation at trust boundaries and preserve the repository's parsing/error conventions.

## Implementation contract

unknown → schema pipeline → validated data → domain mapping.

## Failure handling

Handle malformed input, coercion edge cases and inconsistent error formatting.

## Review

Check schema reuse, optional/default behavior and runtime/type alignment.

## Verification

Run schema and boundary tests plus typecheck.
