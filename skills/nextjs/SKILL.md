---
name: nextjs
description: Apply Next.js-specific App Router, Server Components, routing, caching, rendering, and deployment conventions only when Next.js is detected.
---

## Activate when
Activate only when the next package, next config, or recognizable Next.js app structure is present.

## Repository inspection
Inspect Next.js version, App Router or Pages Router, server/client components, route handlers, middleware, fetch caching, runtime targets, image handling, env exposure, and deployment mode.

## Decision framework
Respect the repository's router and rendering model. Treat server/client boundaries and cache invalidation as runtime contracts.

## Implementation
- Keep server-only code out of client modules.
- Use framework routing conventions rather than introducing parallel routing.
- Make data cache/revalidation behavior explicit.
- Validate route params and external responses at runtime boundaries.

## Load references
Read `references/cache-and-rendering.md` when changing data fetching, caching, revalidation, prerendering, or route rendering.
Read `references/server-client-boundary.md` when crossing Server Components, Client Components, Server Functions, route handlers, middleware, or environment boundaries.

## Failure modes
Watch for accidental client bundling, hydration mismatch, stale cache behavior, server-only API use in the browser, and environment leakage.

## Review
Trace rendering, data, and auth behavior across the server/client boundary.

## Verification
Run the repository's Next.js lint/typecheck/tests/build and route-level smoke or E2E tests where available.
