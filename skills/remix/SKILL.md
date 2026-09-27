---
name: remix
description: Apply Remix-specific route modules, loaders/actions, forms, sessions, and revalidation conventions only when Remix is detected.
---

## Activate when
Activate only when Remix packages, route conventions, or config files confirm the framework.

## Repository inspection
Inspect route modules, loaders, actions, fetchers, sessions, error boundaries, adapters, and deployment/runtime target.

## Decision framework
Keep server data loading in loaders/actions and browser state focused on interaction. Respect Remix revalidation semantics.

## Implementation
- Validate loader/action inputs at runtime.
- Preserve progressive enhancement for forms.
- Keep session/auth logic at the server boundary.
- Avoid duplicating server state in client stores.

## Failure modes
Watch for accidental double fetching, stale revalidation assumptions, action race conditions, and server-only code in browser bundles.

## Review
Check route ownership, data dependencies, forms, and session behavior.

## Verification
Run framework tests/build and focused route or E2E tests.
