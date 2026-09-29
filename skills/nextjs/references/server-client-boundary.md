# Next.js server/client boundary reference

Load when a change crosses Server Components, Client Components, Server Functions, route handlers, middleware, or environment boundaries.

## Rules

Keep server-only modules and secrets out of client-delivered dependency graphs. Inspect transitive imports after introducing or moving a `"use client"` boundary.

Prefer serializable data across server/client boundaries. Keep request-scoped or secret-bearing operations on the server.

Treat route handlers and Server Functions as server trust boundaries: authenticate and authorize server-side, validate external input at runtime, avoid leaking internal errors, and define mutation/idempotency semantics.

## Failure modes

Look for secrets entering client bundles, hydration differences from environment-dependent output, authorization performed only in client components, and unnecessary duplicated fetching across the boundary.

## Verification

Run the framework build, inspect the affected dependency boundary, and exercise unauthorized/authorized paths when authentication or authorization is involved.
