---
name: react-server-components
description: Design React Server Components and client boundaries without leaking server-only code or duplicating data ownership.
---

## Activate when
Use when a framework supports Server Components, client/server directives, server-only modules, server actions, or streamed server rendering.

## Repository inspection
Inspect framework and React versions, server and client module boundaries, routing model, data access placement, serialization constraints, bundler configuration, and authentication context.

## Decision framework
Keep server-only work server-side. Mark client boundaries only where interactivity or browser APIs require them. Treat serialization as an explicit contract.

## Implementation
- Minimize client boundary surface.
- Keep secrets and privileged data access in server-only modules.
- Pass serializable, intentionally shaped props across boundaries.
- Avoid importing server-only modules into client code.
- Test loading, error, and navigation behavior around streamed or deferred content.

## Failure modes
Watch for secret leakage, oversized client bundles, non-serializable props, duplicated fetching, hydration mismatch, and unsupported browser-only behavior in server modules.

## Review
Trace every server and client import boundary and every value crossing it.

## Verification
Run framework-specific build and type checks that enforce server/client constraints. Exercise server rendering, client hydration, and boundary-specific tests.

## Security composition

RSC architecture and RSC security are separate concerns. For server functions, serialization, dependency patching or secret-disclosure reviews, compose with `react-server-security`.
