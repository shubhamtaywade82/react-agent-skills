---
name: mobx
description: Apply MobX conventions for observable ownership, actions, computed values and React observer boundaries when MobX is present.
---

# MobX Adapter

## Activate when

Activate only when MobX and repository observer patterns are detected.

## Repository inspection

Inspect stores, makeAutoObservable/configuration, actions, computed values and React observer usage.

## Decision rules

Keep observable ownership explicit. Use computed values for derivation and actions for mutations. Do not mix MobX state semantics with unrelated global-state libraries.

## Implementation contract

observable → action → computed → observer. Keep side effects at application boundaries.

## Failure handling

Watch for untracked mutations, stale reactions, store coupling and test leakage.

## Review

Check action boundaries, computed derivation, lifecycle cleanup and store scope.

## Verification

Run store/component tests and typecheck/build.
