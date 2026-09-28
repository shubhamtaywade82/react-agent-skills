---
name: arktype
description: Apply ArkType conventions for runtime contracts, inference and composable validation when ArkType is present.
---

# ArkType Adapter

## Activate when

Activate only when ArkType is a repository dependency and used for runtime schemas.

## Repository inspection

Inspect schema definitions, inferred types and parse validation patterns.

## Decision rules

Schema definitions are runtime contracts; keep them at untrusted boundaries and do not bypass them with assertions.

## Implementation contract

untrusted value → ArkType validation → domain contract.

## Failure handling

Handle malformed data and schema/type divergence explicitly.

## Review

Check type inference, runtime errors and schema ownership.

## Verification

Run schema/boundary tests and typecheck.
