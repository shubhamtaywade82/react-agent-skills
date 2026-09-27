# React Observability Safe Context

## Problem
Frontend telemetry includes tokens, full API payloads, or sensitive form values.

## Rule
Telemetry must preserve diagnostic value without becoming a data-exfiltration path.

## Implementation
Capture stable event names, operation IDs, latency, and sanitized error metadata. Redact secrets and sensitive fields before transport.

## Verification
Test emitted events and inspect payloads for prohibited data.
