# TypeScript Async State Machine

## Problem
Model an async operation whose loading, success, failure, and cancellation states must remain mutually consistent.

## Rule
Use a discriminated union when a boolean combination can describe impossible states.

## Implementation
Give each state a unique discriminant and only the payload legal for that state. Model request identity when overlapping operations are possible.

## Verification
Exercise every legal transition plus a stale-response or cancellation case. Require exhaustive narrowing in the implementation.
