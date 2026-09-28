---
name: netlify
description: Apply Netlify conventions for frontend builds, redirects, edge/functions, environment variables and deploy previews when present.
---

# Netlify Adapter

## Activate when

Activate only when Netlify config/workflows are detected.

## Repository inspection

Inspect netlify.toml, build publish directory, redirects, functions/edge code and environment configuration.

## Decision rules

Keep deploy-preview and production behavior explicit. Do not treat redirects as authorization.

## Implementation contract

build → publish artifact → redirects/functions → CDN/runtime.

## Failure handling

Watch for stale deploy artifacts, incorrect SPA fallbacks and environment drift.

## Review

Check headers, redirects, public env values and function boundaries.

## Verification

Run configured build and deploy-preview checks.
