---
name: react-19-modern-apis
description: Apply React 19.2 and 19.3 APIs only when repository evidence confirms installed/runtime support.
---

# React 19 Modern APIs

## Activate when

Activate for React 19.x upgrades or work involving Activity, ViewTransition, Fragment Refs, browser(), use, cacheSignal, resource preloading, or other React 19 APIs.

## Repository inspection

Inspect react/react-dom versions from package manifests and lockfiles, framework and renderer support, server/client entry points, build plugins, and existing use of the target API.

## Decision rules

- Verify the installed version before recommending a version-specific API.
- Activity/useEffectEvent/cacheSignal require React 19.2+ support.
- ViewTransition and Fragment Refs require React 19.3+ support and renderer support.
- browser() requires the runtime/framework support appropriate to the repository.
- use and resource APIs require the supported React/renderer contract.
- Never replace a stable pattern only because a newer primitive exists.

## Implementation contract

For each modern API: verify versions → verify runtime/renderer support → identify lifecycle and server/client constraints → add focused tests → verify hydration/streaming when relevant → document fallback behavior when optional.

DOM-visible APIs require runtime/browser verification, not only typechecking.

## Failure handling

Watch for react/react-dom version mismatch, framework incompatibility despite available types, server-only APIs imported into client modules, hydration nondeterminism, missing reduced-motion handling, and incorrect cleanup/abort behavior. Use a compatible existing pattern when the repository does not support the API.

## Review

Check package/lockfile evidence, renderer support, server/client boundaries, hydration determinism, accessibility/reduced motion, cleanup semantics, and client bundle leakage.

## Verification

Run focused tests plus repository-standard typecheck/lint/build. Use real browser verification for DOM/transition/ref behavior.
