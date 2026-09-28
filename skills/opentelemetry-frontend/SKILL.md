---
name: opentelemetry-frontend
description: Apply OpenTelemetry conventions for browser traces, attributes, propagation and privacy-aware instrumentation when present.
---

# OpenTelemetry Frontend Adapter

## Activate when

Activate only when OpenTelemetry browser packages/configuration are present.

## Repository inspection

Inspect tracer/provider setup, exporters, propagation, resource attributes and sampling.

## Decision rules

Instrument user-visible boundaries and meaningful network/navigation spans without collecting sensitive payloads.

## Implementation contract

interaction/navigation → span → propagation → exporter → backend correlation.

## Failure handling

Handle exporter outages, sampling changes and excessive cardinality.

## Review

Check PII, URLs/query values, sampling and release correlation.

## Verification

Run instrumentation tests and verify traces in the configured test environment.
