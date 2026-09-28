---
name: frontend-offline-pwa
description: Design service-worker, offline-cache and offline-mutation behavior with explicit freshness, replay and update contracts.
---

# Frontend Offline PWA

## Activate when

Activate for service workers, offline-first features, cache strategies, installability, background sync or queued offline mutations.

## Repository inspection

Inspect service worker registration, cache names/versions, precache/runtime cache rules, update flow, manifest, offline storage, mutation queue and deployment strategy.

## Decision rules

Classify each resource as cache-first, network-first, stale-while-revalidate or never-cache. Never cache credentials or sensitive responses without an explicit security contract.

Offline writes require idempotency, replay ordering and conflict handling.

## Implementation contract

Model:

online → offline → queued → replaying → acknowledged | conflicted | failed

Make service-worker updates observable and recoverable. Ensure a new asset graph cannot be served with an incompatible old runtime.

## Failure handling

Handle stale caches, failed replays, duplicate mutations, version skew, storage quota, corrupt queue state and service-worker registration failures.

## Review

Check cache scope, sensitive data, update/rollback, cache invalidation, queue durability and UX for offline state.

## Verification

Use browser tests with controlled network conditions, fresh profiles and update scenarios. Verify both first install and upgrade behavior.
