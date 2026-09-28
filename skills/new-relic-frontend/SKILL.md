---
name: new-relic-frontend
description: Apply New Relic browser monitoring conventions for SPA timing, errors, distributed tracing and privacy when present.
---

# New Relic Frontend Adapter

## Activate when

Activate only when New Relic browser monitoring is configured.

## Repository inspection

Inspect agent initialization, SPA instrumentation, attributes, release/environment metadata and privacy settings.

## Decision rules

Collect only operationally useful attributes. Do not expose secrets through custom attributes.

## Implementation contract

navigation/interaction/error → sanitized telemetry → release context → New Relic.

## Failure handling

Handle duplicate instrumentation, high-cardinality attributes and environment drift.

## Review

Check privacy, source maps where used and deployment correlation.

## Verification

Run monitoring/build checks and a safe non-production telemetry smoke test where available.
