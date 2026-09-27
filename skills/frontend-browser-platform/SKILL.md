---
name: frontend-browser-platform
description: Engineer against browser APIs, event lifecycles, storage, URL state, workers, visibility, focus, and platform capabilities.
---

## Activate when
Use when browser APIs, DOM events, storage, page lifecycle, clipboard, notifications, workers, media, or URL/history behavior are involved.

## Repository inspection
Inspect supported browsers, polyfills, SSR constraints, browser utility modules, event listeners, storage wrappers, permissions, and test environment limitations.

## Decision framework
Prefer stable platform primitives before dependencies. Define availability and fallback behavior for APIs that are optional, permissioned, or browser-specific.

## Implementation
- Feature-detect browser capabilities where necessary.
- Clean up listeners, observers, workers, timers, and object URLs.
- Treat localStorage, URLs, DOM content, and browser messages as untrusted inputs.
- Avoid assuming window or document exist during SSR/build phases.
- Preserve focus, history, and navigation semantics intentionally.

## Failure modes
Watch for memory leaks, duplicate listeners, SSR crashes, storage corruption, permission races, and behavior that differs between real browsers and jsdom-like environments.

## Review
Check lifecycle cleanup, capability detection, security boundaries, browser compatibility, and test realism.

## Verification
Run browser-level tests for meaningful DOM/platform behavior. Add focused unit tests for pure parsing and normalization code.
