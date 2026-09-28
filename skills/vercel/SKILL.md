---
name: vercel
description: Apply Vercel conventions for frontend deployment, environment separation, caching, previews and framework runtime behavior when Vercel is present.
---

# Vercel Adapter

## Activate when

Activate only when Vercel project/configuration or deployment workflow is present.

## Repository inspection

Inspect vercel.json, build/output settings, project environments, edge/server functions, cache headers and deployment CI.

## Decision rules

Treat preview, production and development environments separately. Do not expose server secrets through public environment variables.

## Implementation contract

source → build → deployment artifact → runtime environment → CDN/cache → observability.

## Failure handling

Handle environment drift, cache invalidation, route runtime mismatch and preview/production divergence.

## Review

Check public env prefixes, deployment output and rollback/cache strategy.

## Verification

Run build plus preview/production-equivalent checks available in CI.
