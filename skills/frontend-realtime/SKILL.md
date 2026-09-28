---
name: frontend-realtime
description: Build browser realtime flows with explicit connection, validation, ordering, reconnection, backpressure and cleanup contracts.
---

# Frontend Realtime

## Activate when

Activate for WebSocket, SSE, streaming transports, realtime dashboards, subscriptions or server-pushed events.

## Repository inspection

Inspect transport client, connection lifecycle, message schema, authentication, retry/backoff, ordering assumptions, buffering and component/store ownership.

## Decision rules

Treat every message as untrusted input. Validate before state mutation. Define whether ordering is guaranteed by transport or by application sequence numbers.

Reconnect with bounded backoff and cleanup on unmount/navigation.

## Implementation contract

Model:

disconnected → connecting → connected → degraded → reconnecting

Define duplicate, late, malformed and out-of-order message behavior. Apply backpressure or sampling for high-rate streams.

## Failure handling

Handle reconnect storms, auth expiry, duplicate events, stale subscriptions, memory growth and partial stream failure.

## Review

Check validation, cleanup, retry limits, authentication refresh, message ordering and UI overload.

## Verification

Test connect/disconnect, reconnect, malformed message, duplicate/out-of-order event, auth expiry and cleanup scenarios.
