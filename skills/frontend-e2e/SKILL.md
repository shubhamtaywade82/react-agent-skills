---
name: frontend-e2e
description: Validate critical browser workflows at the real page and network boundary with deterministic end-to-end tests.
---

## Activate when
Use when a change affects navigation, authentication, forms, payments, multi-step workflows, browser APIs, or other user journeys that component tests cannot prove.

## Repository inspection
Identify the existing E2E framework, browser matrix, test web server, fixtures, authentication bootstrap, network interception, selectors, retries, and CI execution model.

## Decision framework
Use E2E only for cross-boundary behavior that needs a browser. Keep most logic in unit/component tests. Prefer stable user-facing selectors and deterministic test data.

## Implementation
- Test user-visible outcomes, not component internals.
- Isolate authentication setup from each scenario when safe.
- Control third-party and unstable network boundaries.
- Make waits event-driven; avoid arbitrary sleeps.
- Capture useful traces/screenshots only when the failure signal benefits.

## Failure modes
Watch for flaky timing, environment coupling, shared test data, brittle selectors, hidden network dependencies, and tests that pass only under one browser.

## Review
Check critical-path coverage, determinism, isolation, browser matrix, and failure diagnostics.

## Verification
Run focused E2E specs, then the repository's full E2E command and CI-equivalent command when practical.
