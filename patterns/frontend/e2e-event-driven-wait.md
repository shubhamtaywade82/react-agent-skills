# E2E Event-Driven Wait

## Problem
A browser test sleeps for a fixed duration before asserting a result.

## Rule
Synchronize on user-visible or network-visible events, not elapsed time.

## Implementation
Wait for the target condition, response, navigation, or UI transition with the framework's supported primitives.

## Verification
Repeat the test under slower and faster execution conditions and confirm deterministic completion.
