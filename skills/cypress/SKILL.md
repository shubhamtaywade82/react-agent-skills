---
name: cypress
description: Apply Cypress-specific component or end-to-end testing conventions only when Cypress is detected.
---

## Activate when
Activate only when Cypress packages, config, or scripts are present.

## Repository inspection
Inspect Cypress version, support files, fixtures, commands, component versus E2E setup, intercepts, retries, browser configuration, and CI artifacts.

## Decision framework
Use Cypress for browser workflows the repository already owns; keep pure business logic outside Cypress tests.

## Implementation
- Prefer resilient DOM assertions.
- Control unstable HTTP boundaries with intercepts.
- Keep test data isolated.
- Avoid fixed waits.
- Keep custom commands narrow and explicit.

## Failure modes
Watch for command chaining that hides timing, brittle selectors, leaked state, and tests that depend on third-party availability.

## Review
Check user-visible outcomes, isolation, and reproducibility.

## Verification
Run focused Cypress specs and the configured full browser suite.
