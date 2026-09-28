---
name: datadog-frontend
description: Apply Datadog browser monitoring conventions for RUM, errors, releases, session data and privacy when present.
---

# Datadog Frontend Adapter

## Activate when

Activate only when Datadog browser/RUM configuration is detected.

## Repository inspection

Inspect RUM SDK initialization, environment/release tags, allowed tracing, privacy options and source map flow.

## Decision rules

Do not capture sensitive form fields or secrets. Keep environment/release identifiers consistent with deployment.

## Implementation contract

page/action/error → sanitized event → release/env context → Datadog.

## Failure handling

Handle excessive session data, source-map mismatch and duplicated instrumentation.

## Review

Check privacy masking and payload sanitization.

## Verification

Run monitoring tests/build and verify non-production telemetry when permitted.
