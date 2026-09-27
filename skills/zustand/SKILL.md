---
name: zustand
description: Apply Zustand store conventions for small shared client-state surfaces only when Zustand is detected.
---

## Activate when
Activate only when Zustand packages and stores are present.

## Repository inspection
Inspect store creation, slices, selectors, middleware, persistence, subscriptions, and existing local-state patterns.

## Decision framework
Use stores for genuinely shared client state. Keep feature-local state local when a provider/store adds no value.

## Implementation
- Define minimal store surfaces.
- Select only required state to limit renders.
- Keep async side effects and persistence boundaries explicit.
- Avoid storing server cache copies without a documented ownership reason.

## Failure modes
Watch for over-globalization, broad selectors, stale async writes, hidden persistence, and circular store dependencies.

## Review
Check ownership, render subscriptions, persistence scope, and async race behavior.

## Verification
Test store transitions through user-visible behavior where practical and unit-test critical pure store logic.
