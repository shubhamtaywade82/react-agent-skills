---
name: docker-kubernetes-frontend
description: Apply container and Kubernetes conventions for frontend build artifacts, runtime config, probes, caching and rollout safety.
---

# Docker Kubernetes Frontend Adapter

## Activate when

Activate only when Dockerfiles and/or Kubernetes manifests deploy the frontend.

## Repository inspection

Inspect multi-stage build, image base, runtime server, config injection, probes, manifests and rollout strategy.

## Decision rules

Keep build-time and runtime configuration distinct. Do not bake secrets into images.

## Implementation contract

source → build image → runtime image → config → service/ingress → rollout.

## Failure handling

Handle stale image tags, missing runtime config, probe failures and partial rollout.

## Review

Check image minimization, non-root execution, cache headers and rollback.

## Verification

Build image, run container smoke test and validate manifests when available.
