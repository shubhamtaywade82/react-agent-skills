---
name: frontend-production
description: Prepare frontend applications for production through build correctness, deployability, runtime diagnostics, caching, assets, and rollback safety.
---

## Activate when
Use when changing production builds, deploy configuration, asset hosting, cache headers, monitoring, release processes, or runtime error handling.

## Repository inspection
Inspect build scripts, artifact structure, environment injection, hosting and CDN, service workers, source maps, health checks, error reporting, caching, rollback procedure, and CI release gates.

## Decision framework
Make release behavior deterministic. Separate immutable assets from mutable runtime configuration. Choose cache policy based on asset identity and deployment semantics.

## Implementation
- Keep production configuration explicit and validated.
- Ensure failed builds stop release progression.
- Preserve diagnostic source maps according to security policy.
- Make client error reporting actionable without leaking sensitive data.
- Treat service workers and caches as deploy state that may outlive the current page.
- Keep rollback and cache invalidation procedures documented.

## Failure modes
Watch for stale bundles, mismatched HTML and assets, environment leakage, service-worker traps, missing error diagnostics, and unreproducible release artifacts.

## Review
Check build reproducibility, artifact integrity, runtime observability, cache semantics, and rollback path.

## Verification
Run production-mode build, smoke tests, deployment-equivalent checks, and artifact inspection. Confirm CI release gates remain meaningful.


## Platform composition

Compose with the detected deployment adapter (Vercel, Netlify, Cloudflare, AWS, Docker/Kubernetes, or GitHub Pages) rather than assuming a single hosting model. Verify build artifact, environment separation, caching, source maps, rollback and runtime configuration at the actual platform boundary.
