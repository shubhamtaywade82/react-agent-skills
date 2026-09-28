---
name: tanstack-start
description: Apply TanStack Start conventions for routing, server functions, SSR and client/server boundaries when TanStack Start is present.
---

# TanStack Start Adapter

## Activate when

Activate only when TanStack Start packages/configuration are detected.

## Repository inspection

Inspect route tree, server functions, loaders/data APIs, rendering mode and build/deployment integration.

## Decision rules

Respect the framework server/client boundary and route conventions. Do not copy unsupported Next/Remix semantics.

## Implementation contract

route → server/client boundary → data → rendering/cache → navigation.

## Failure handling

Watch for hydration mismatch, server-only imports in client code and auth/cache leakage.

## Review

Check serialization, authorization and route loading.

## Verification

Run framework build plus route/integration/browser tests.
