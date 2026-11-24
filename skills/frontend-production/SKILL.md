---
name: frontend-production
description: Prepare frontend applications for production through build correctness, deployability, runtime diagnostics, caching, assets, and rollback safety.
license: MIT
---

# Frontend Production

## Purpose

Frontend deploys are distributed upgrades: every open tab is a server you cannot restart, running whatever bundle it loaded hours ago. Production readiness therefore means deterministic builds (same commit → same artifact), immutable content-hashed assets separated from mutable runtime configuration, caching keyed to that identity, diagnostics that survive into the deployed artifact, and a rollback path that accounts for clients still running last week's code.

## Activate when

- changing production builds, deploy configuration, or asset hosting;
- setting cache headers, source-map policy, or environment injection;
- wiring client error reporting or runtime diagnostics;
- working with service workers, release processes, or rollback procedures.

## Boundary with related skills

- Use `frontend-security` for security headers, CSP, and content-trust policy.
- Use `react-error-resilience` for in-app failure states; this skill for production diagnostics infrastructure.
- Use `frontend-dependency-management` for the bundle-weight inputs the build ships.
- Use the deployment adapter guidance when the repo pins one (Vercel, Netlify, Cloudflare, AWS, Docker/Kubernetes, GitHub Pages).

## Repository inspection

Inspect build scripts and their modes (is `NODE_ENV=production` actually set?), artifact structure (hashing, entry files), environment-variable injection (build-time vs runtime), hosting/CDN cache configuration, service workers and their update strategy, source-map generation and upload policy, error reporting SDK, health/version endpoints, rollback procedure documentation, and the CI release gates.

## Decision rules

- Release behavior is deterministic: build is reproducible from a commit; failed builds stop the release; artifacts are versioned and inspectable.
- Immutable assets get content hashes and far-future immutable caching (`Cache-Control: public, max-age=31536000, immutable`); entry HTML is never long-cached — it is the pointer that must rotate.
- Environment separation: secrets never enter the bundle; runtime-varying config reaches the client at request time (injected endpoint or config fetch), not baked into the artifact.
- Source maps are diagnostic assets with a policy: uploaded to the error reporter and/or kept private — never published where clients can read source.
- Service workers are deploy state that outlives the page: update flows must be explicit (skipWaiting decisions, activation handling), or the fleet runs stale code for days.
- Error reporting is actionable without leaking data: release version, build ID, and environment attached; PII redacted at the boundary.
- Rollback is a rehearsed procedure with cache semantics accounted for — old HTML may point at pruned assets unless cleanup waits past the cache horizon.

## Implementation procedure

1. Verify the production build: mode flags set, output hashed, artifact complete (no dev-only chunks).
2. Separate configuration: build-time invariants vs runtime config; wire the runtime path and validate it at startup.
3. Set the cache matrix: immutable hashed assets vs non-cached HTML vs versioned config; write it down per route/asset class.
4. Wire diagnostics: error reporter with release/build metadata, source maps uploaded per policy, a version health endpoint for deploy verification.
5. Define the service-worker update flow (or confirm none exists) and its stale-client behavior.
6. Rehearse rollback: which artifact returns, what invalidates, how long stale clients live — then document it.

**Reference example** — the artifact/config split and deploy verification:

```txt
dist/
  index.html                 ← never cached long; references the hashed assets below
  assets/app-8f3c21ab.js     ← immutable: Cache-Control: public, max-age=31536000, immutable
  assets/app-8f3c21ab.css    ← same hash-keyed identity; safe to cache forever
  /api/config                ← runtime config endpoint (mutable), fetched at boot
```

```ts
// Version health endpoint: deploy verification + rollback confirmation in one place.
app.get("/health", (_req, res) =>
  res.json({ version: BUILD_ID, deployedAt: DEPLOY_TIME, configOk: Boolean(runtimeConfig.apiUrl) }));
```

The health endpoint answers the question every deploy drama starts with — "what is actually running out there?" — before anyone opens a dashboard.

## Anti-patterns / failure modes

- Stale bundles: entry HTML cached long-term, so clients miss deploys (or reference pruned hashes and white-screen).
- HTML and assets deployed out of order — the new HTML arrives before its assets (deploy assets first, HTML last).
- Secrets or environment-specific values baked into the bundle and shipped to every client.
- Service worker installed once, never updated — the fleet pins itself to launch-week code.
- Source maps published publicly — source and internal structure exposed to anyone.
- Error reporting without release metadata — "TypeError: cannot read properties of undefined" with no build ID is unactionable noise.
- Rollback that returns old HTML while its hashed assets were pruned from the CDN.
- Unreproducible artifacts — the build no one can rebuild cannot be rolled back either.

## Agent review checklist

- Is the build reproducible and gated (failed build stops the release)?
- Are assets immutable-hashed, HTML cache-free, and the deploy order right?
- Do secrets stay out of the bundle; is runtime config validated at startup?
- Do source maps follow a written policy (reporter upload, private)?
- Is the service-worker update path explicit?
- Is rollback rehearsed with cache horizons accounted for?

## Verification

Production-mode build passes and is inspected (hashed assets, no dev chunks, no leaked env); smoke tests against the deployed-equivalent artifact; cache headers verified per asset class (curl the CDN); version health endpoint confirms deploy; error reporter receives a test event with correct release metadata.
