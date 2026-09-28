---
name: frontend-workers
description: Manage Web Workers, Shared Workers and worker-backed computation with typed messages, cancellation and lifecycle cleanup.
---

# Frontend Workers

## Activate when

Activate for Worker/SharedWorker APIs, off-main-thread computation or worker-backed data processing.

## Repository inspection

Inspect worker entry, message protocol, bundler worker support, transferable objects, termination behavior and error handling.

## Decision rules

Workers are separate execution contexts. Validate inbound/outbound messages and explicitly manage termination. Do not assume worker APIs are available in every rendering environment.

## Implementation contract

main thread → validated command → worker → validated result/error → cancellation/termination

Bound work and memory for large inputs.

## Failure handling

Handle worker startup failure, runtime error, malformed result, cancellation and navigation/unmount cleanup.

## Review

Check lifecycle ownership, transfer semantics, retries, memory pressure and SSR/build compatibility.

## Verification

Test startup, command/result protocol, cancellation, errors and cleanup.
