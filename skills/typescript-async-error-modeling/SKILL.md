---
name: typescript-async-error-modeling
description: Model asynchronous success, failure, cancellation, and retry states without ambiguous flag combinations.
---

## Activate when
Use when async workflows, promise-heavy UI logic, retries, cancellation, timeouts, or error normalization are being changed.

## Repository inspection
Inspect TypeScript version, strictness, existing Result/error conventions, async helpers, API clients, test utilities, and whether cancellation uses AbortSignal. Identify whether errors cross a public module boundary.

## Decision framework
Prefer discriminated unions when states have different legal data. Separate expected operational failures from programmer faults. Make cancellation distinct when callers need different behavior. Keep retry policy outside low-level types unless the type itself represents retryable state.

## Implementation
- Give async state one authoritative source of truth.
- Model loading, success, failure, and cancellation transitions explicitly when concurrent operations exist.
- Normalize unknown thrown values at boundaries.
- Preserve error causes where the runtime supports them.
- Make stale-result prevention and request identity explicit.
- Avoid boolean combinations that permit contradictory states.

## Failure modes
Watch for swallowed exceptions, any-typed error values, stale responses overwriting newer state, retries that duplicate side effects, and cancellation being displayed as a user error.

## Review
Check transition completeness, exhaustive narrowing, error provenance, race handling, retry safety, and whether the chosen types match the actual runtime contract.

## Verification
Add deterministic tests for success, operational failure, cancellation, retry, and stale-response cases. Run repository typecheck, lint, tests, and build as applicable.
