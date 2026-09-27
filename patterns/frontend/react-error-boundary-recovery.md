# React Error Boundary Recovery

## Problem
An error boundary catches a rendering failure but offers no deterministic recovery path.

## Rule
A recoverable boundary needs reset semantics tied to meaningful ownership.

## Implementation
Place the boundary around a user-recoverable region, expose a useful fallback, and define what state/cache is reset on retry.

## Verification
Trigger a deterministic failure, assert the fallback, reset, and successful recovery without hiding unrelated failures.
