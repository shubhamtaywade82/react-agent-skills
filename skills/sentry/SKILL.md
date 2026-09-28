---
name: sentry
description: Apply Sentry conventions for source maps, release correlation, error context and PII scrubbing when Sentry is present.
---

# Sentry Adapter

## Activate when

Activate only when Sentry packages/configuration are present.

## Repository inspection

Inspect SDK setup, release/version config, source-map upload, environment tags and event processors.

## Decision rules

Never send secrets or unnecessary personal data. Correlate events with deploy releases.

## Implementation contract

error → safe context → release/environment → Sentry event → source-mapped diagnosis.

## Failure handling

Handle upload mismatch, duplicate errors, missing source maps and noisy breadcrumbs.

## Review

Check PII scrubbing and sensitive network/storage data.

## Verification

Run build/source-map validation and an intentional test event in a non-production environment when permitted.
