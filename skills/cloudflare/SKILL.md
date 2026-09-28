---
name: cloudflare
description: Apply Cloudflare Pages/Workers conventions for edge runtime constraints, bindings, caching and deployment when present.
---

# Cloudflare Adapter

## Activate when

Activate only when Cloudflare Workers/Pages configuration is present.

## Repository inspection

Inspect wrangler config, bindings, routes, compatibility settings and deployment workflow.

## Decision rules

Respect edge runtime APIs; do not assume Node APIs exist.

## Implementation contract

bundle → edge entry → bindings → cache/response → client.

## Failure handling

Handle runtime API mismatch, binding configuration and cache leakage.

## Review

Check secrets/bindings, cache scope and compatibility settings.

## Verification

Run the repository build and edge-compatible tests.
