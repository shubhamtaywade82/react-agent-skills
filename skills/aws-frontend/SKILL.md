---
name: aws-frontend
description: Apply AWS frontend deployment conventions for S3/CloudFront, serverless/edge runtimes, cache invalidation and environment separation when present.
---

# AWS Frontend Adapter

## Activate when

Activate only when AWS deployment manifests or CI evidence are present.

## Repository inspection

Inspect S3/CloudFront, Lambda/edge functions, infrastructure code, asset manifests and cache invalidation.

## Decision rules

Separate static assets from compute and configuration. Do not put secrets in public bundles.

## Implementation contract

build → artifact store → CDN → runtime/config → invalidation.

## Failure handling

Handle stale assets, invalid invalidations, origin errors and environment drift.

## Review

Check cache headers, immutable asset naming and deployment rollback.

## Verification

Run build and infrastructure/deployment validation available in CI.
