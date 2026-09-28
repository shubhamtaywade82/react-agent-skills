---
name: frontend-messaging
description: Secure browser messaging across windows, iframes, workers and tabs with explicit origins, schemas and lifecycle handling.
---

# Frontend Messaging

## Activate when

Activate for postMessage, MessageChannel, BroadcastChannel, cross-tab coordination or iframe/worker messaging.

## Repository inspection

Inspect message origin/source validation, schemas, channel lifecycle, sender/receiver ownership and teardown.

## Decision rules

Never trust message data or origin implicitly. Validate origin/source and message schema before state mutation. Use structured message types rather than unversioned blobs.

## Implementation contract

sender → transport → origin/source gate → schema validation → typed handler → lifecycle cleanup

## Failure handling

Reject unexpected origins, malformed messages, unknown message types and duplicate/replayed events.

## Review

Check origin allowlists, source identity, payload validation, channel closure and sensitive data disclosure.

## Verification

Test valid, malformed, wrong-origin, wrong-source, unknown-type and disconnect scenarios.
