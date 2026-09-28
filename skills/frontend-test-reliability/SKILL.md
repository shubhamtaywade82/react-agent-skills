---
name: frontend-test-reliability
description: Detect and eliminate flaky frontend tests through deterministic state, isolation, timing control, retries and failure diagnostics.
---

# Frontend Test Reliability

## Activate when

Activate for flaky tests, intermittent browser failures, parallelization issues, retries, sharding or test-suite trust problems.

## Repository inspection

Inspect test runner config, parallelism, retries, fake timers, randomness, clock control, network mocks, storage state, worker fixtures and CI resource limits.

## Decision rules

A retry can mask a flaky test; it is not a fix. Preserve failure diagnostics and measure flake rate separately from pass rate.

Prefer event-driven waits and deterministic fixtures over time-based sleeps.

## Implementation contract

Each test owns its state and cleans up. Control clock/randomness when behavior depends on them. Isolate network/data fixtures and avoid shared mutable browser state.

## Failure handling

Classify flakes as race, timing, order, resource, network, environment or product defect. Quarantine only with an owner and explicit exit condition.

## Review

Check retries, skipped tests, sleeps, global state, test ordering assumptions and fixture leakage.

## Verification

Run targeted tests repeatedly only after a change, then run CI-equivalent parallel/sharded suites when relevant. Preserve traces/logs for browser flakes.
