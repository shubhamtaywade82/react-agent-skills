---
name: trpc
description: Apply tRPC conventions for end-to-end procedure typing, validation, transport and TanStack integration when tRPC is present.
---

# tRPC Adapter

## Activate when

Activate only when tRPC client/server packages and routers are detected.

## Repository inspection

Inspect router/procedure definitions, input schemas, client setup, transformer, batching and query integration.

## Decision rules

Treat router procedures as transport contracts, not domain models. Keep input validation on the server. Do not bypass typed procedures with ad hoc fetches.

## Implementation contract

procedure → input validation → server result/error → client cache/UI. Preserve procedure names and input/output compatibility.

## Failure handling

Handle router/client version skew, serialization mismatch, auth errors and cache invalidation errors.

## Review

Check runtime validation, transformer compatibility, authorization and generated client types.

## Verification

Run server procedure tests and client integration/typecheck/build checks.
