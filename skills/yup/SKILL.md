---
name: yup
description: Apply Yup conventions for runtime validation, field schemas, transforms and form integration when Yup is present.
---

# Yup Adapter

## Activate when

Activate only when Yup is present, typically through a form resolver.

## Repository inspection

Inspect schema composition, transforms, defaults, nullable/optional semantics and resolver integration.

## Decision rules

Keep schema semantics explicit and avoid relying on TypeScript annotations as runtime validation.

## Implementation contract

input → schema validation → normalized value/error → domain/use.

## Failure handling

Watch for transforms that silently alter trusted values, optional/null differences and localized messages.

## Review

Check error mapping and schema/runtime alignment.

## Verification

Run validation/form tests and typecheck.
