---
name: msw
description: Apply Mock Service Worker conventions for network-boundary testing without mocking React internals.
---

## Activate when
Activate only when MSW packages, handlers, or server setup are present.

## Repository inspection
Inspect browser and server handlers, lifecycle setup, request matchers, generated API contracts, and how tests override responses.

## Decision framework
Mock at the transport boundary. Keep default handlers realistic and override only the scenario under test.

## Implementation
- Define handlers near the API contract.
- Return realistic status, headers, latency, and payload shapes.
- Test success, validation, auth, rate-limit, conflict, and server-error paths.
- Reset handlers after each test.

## Failure modes
Watch for handler drift, overly broad URL matches, leaked overrides, and mock responses that cannot occur in production.

## Review
Check fidelity to the real API contract and failure coverage.

## Verification
Run network-boundary tests with default and overridden handlers. Pair with E2E for critical browser journeys.
