---
name: typescript-api-contracts
description: Design typed client/server API contracts with explicit transport, domain, validation, error, and compatibility boundaries.
---

## Activate when
Use when a React app consumes or defines HTTP, RPC, GraphQL, websocket, or generated API contracts.

## Repository inspection
Inspect API client code, generated types, OpenAPI/GraphQL sources, runtime validators, error envelopes, auth/session assumptions, pagination, caching, and versioning conventions.

## Decision framework
Keep transport types distinct from validated domain types when server data is untrusted or transformed. Treat generated TypeScript as a compile-time aid, not runtime proof.

## Implementation
- Define request, response, error, and pagination contracts explicitly.
- Validate untrusted responses at the runtime boundary.
- Normalize non-success responses without erasing status or correlation identifiers.
- Make partial/nullable fields explicit.
- Preserve idempotency and mutation semantics at the API boundary.
- Make API version compatibility observable and testable.

## Failure modes
Do not cast API responses into domain types, infer authorization from UI state, or let one generic error type erase retryable versus terminal conditions.

## Review
Verify contract ownership, runtime validation, error semantics, compatibility, and cache identity.

## Verification
Use boundary fixtures or contract tests for successful, invalid, unauthorized, forbidden, conflict, rate-limit, and server-error responses.
