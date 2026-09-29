# Next.js cache and rendering reference

Load when changing data fetching, caching, revalidation, prerendering, or route rendering.

## Inspect first

- Next.js version and App Router or Pages Router.
- Route segment configuration and existing cache conventions.
- Fetch/cache helpers, revalidation settings, and invalidation APIs.
- Runtime target: Node.js, Edge, or browser.

## Decision rules

Prefer the repository's existing caching model. Do not add cache directives only to silence a stale-data symptom.

For App Router work, reason separately about static output, request-time rendering, data caching/memoization, explicit revalidation/invalidation, and client router/cache behavior.

When freshness is required, identify the owner of freshness before changing headers or client state.

## Failure modes

Check for stale data caused by an unexpected cache layer, accidental dynamic rendering, incorrect invalidation scope, server-only fetch behavior in client modules, and environment-sensitive output becoming statically embedded.

## Verification

Exercise the affected route through the real build/runtime path and verify the expected fresh and cached/revalidated paths when caching is part of the change.
