---
name: react-router
description: Apply React Router-specific routing, data APIs, loaders/actions, error elements, and URL state conventions only when the package is present.
---

## Activate when
Activate only when React Router packages or existing route configuration proves usage.

## Repository inspection
Inspect router version, declarative or data router mode, route hierarchy, loaders/actions, error elements, navigation blockers, lazy routes, and URL parameter conventions.

## Decision framework
Treat URL structure as a public contract. Keep route-specific data ownership near routes and avoid parallel navigation state.

## Implementation
- Validate route params and search params.
- Preserve deep-link and back/forward semantics.
- Handle pending/error states at route boundaries.
- Keep redirects and authorization rules explicit.

## Failure modes
Watch for route-state duplication, broken deep links, uncontrolled redirects, stale loader data, and error boundaries that hide actionable failures.

## Review
Check route hierarchy, URL contracts, navigation state, and loader lifecycle.

## Verification
Run router tests plus focused navigation and deep-link E2E tests.
