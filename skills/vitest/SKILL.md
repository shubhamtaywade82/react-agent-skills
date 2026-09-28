---
name: vitest
description: Apply Vitest-specific test configuration, mocking, environments, coverage, and workspace conventions only when Vitest is detected.
---

## Activate when
Activate only when Vitest package/configuration or scripts confirm usage.

## Repository inspection
Inspect Vitest version, config, environment, setup files, aliases, fake timers, mocks, coverage, and workspace projects.

## Decision framework
Keep tests deterministic and close to behavior boundaries. Prefer explicit module mocking only where the repository architecture requires it.

## Implementation
- Reset mocks and timers reliably.
- Match the configured environment to the behavior under test.
- Keep fake time explicit and minimal.
- Preserve source-map and stack-trace quality.

## Failure modes
Watch for leaked mocks, fake-timer deadlocks, environment mismatch, global state between tests, and tests that pass only in isolation.

## Review
Check isolation, deterministic setup, coverage meaning, and mock boundary quality.

## Verification
Run focused Vitest tests, full test suite, coverage when configured, and typecheck.

## Browser Mode

When Vitest Browser Mode is configured, compose with `vitest-browser` for real-browser semantics. Keep Browser Mode cases focused and deterministic.
