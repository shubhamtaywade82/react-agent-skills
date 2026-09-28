---
name: openapi-tooling
description: Govern OpenAPI-generated frontend clients and types with schema ownership, runtime validation and regeneration checks.
---

# OpenAPI Tooling Adapter

## Activate when

Activate only when OpenAPI specs or generator configuration are present.

## Repository inspection

Inspect API spec source, generator, generated client/types, runtime validators and package ownership.

## Decision rules

The OpenAPI document is a transport contract, not automatically a trusted runtime guarantee. Preserve runtime validation for untrusted responses where required.

## Implementation contract

OpenAPI → generation → client/types → runtime boundary → domain mapping.

Never patch generated clients as the durable fix.

## Failure handling

Handle spec/code drift, incompatible generator versions and missing response validation.

## Review

Check generated surface, error models, pagination, auth and schema compatibility.

## Verification

Regenerate, run contract/client tests, typecheck and build.
