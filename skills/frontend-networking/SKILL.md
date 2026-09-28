---
name: frontend-networking
description: Engineer browser networking around request contracts, cancellation, retries, caching, CORS, timeouts and observability.
---

# Frontend Networking

## Activate when

Activate for fetch/XHR, API clients, retries, timeouts, CORS, request cancellation, upload/download or network middleware.

## Repository inspection

Inspect transport client, base URL config, authentication, cache layer, retry policy, timeout behavior, request IDs and error normalization.

## Decision rules

Validate untrusted responses. Make cancellation and retry policy explicit. Do not retry non-idempotent operations blindly.

## Implementation contract

request identity → timeout/abort → transport → status classification → schema validation → domain error

Preserve server error semantics across UI boundaries.

## Failure handling

Classify DNS/network, timeout, 4xx, 5xx, abort, malformed payload and CORS failures separately.

## Review

Check sensitive headers, credential mode, retries, cache, idempotency and telemetry.

## Verification

Test success, timeout, abort, retryable/non-retryable errors, malformed response and auth expiry.
