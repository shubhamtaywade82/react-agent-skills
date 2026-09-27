# Browser Worker Lifecycle

## Problem
Workers continue running after the feature that created them is gone.

## Rule
A worker lifecycle must follow the owning feature lifecycle.

## Implementation
Create the worker at the explicit ownership boundary, terminate it on cleanup, handle worker errors, and define message schemas.

## Verification
Test creation, message exchange, error handling, teardown, and remount without worker accumulation.
