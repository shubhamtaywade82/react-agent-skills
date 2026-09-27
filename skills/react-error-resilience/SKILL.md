---
name: react-error-resilience
description: Use for React error boundaries, loading/empty/error states, retries, cancellation, graceful degradation, and recovery UX.
---

# React Error Resilience

## Purpose
Make failure states explicit and recoverable.

## Activate when
- adding data-dependent UI;
- handling render failures;
- designing retry/recovery behavior;
- introducing error boundaries.

## Repository inspection
Inspect existing error boundaries, route-level errors, API error normalization, retry policy, loading/empty states, and observability.

## Decision rules
- Distinguish loading, empty, rejected, unauthorized, unavailable, and unexpected failures.
- Retry only when operation semantics make retry safe/useful.
- Preserve user context during recovery.
- Error boundaries handle render-tree failures; request errors need request-level handling.
- Avoid retry storms and duplicate submissions.

## Implementation procedure
1. Enumerate failure states.
2. Assign each state an owner.
3. Define recovery action.
4. Instrument unexpected failures.
5. Test recovery and non-recovery paths.

## Anti-patterns / failure modes
- one generic message for every failure;
- infinite retries;
- error boundaries used as API error handling;
- reset behavior that silently loses user work.

## Agent review checklist
- What failures are expected?
- Which are recoverable?
- Is retry safe?
- What context survives?

## Verification
Failure-injection tests, retry/cancellation tests, error-boundary tests, and relevant observability checks.
