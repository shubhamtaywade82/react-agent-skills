# Service Worker Rollout Safety

## Problem
An old service worker keeps serving stale application state after a release.

## Rule
Service workers and caches are deployment state and need explicit rollout semantics.

## Implementation
Version caches, control update/activation behavior intentionally, and define how clients recover from incompatible cached assets.

## Verification
Exercise first install, update, refresh, rollback or cache cleanup, and offline behavior when the product supports it.
