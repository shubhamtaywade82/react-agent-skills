# Frontend Browser Listener Cleanup

## Problem
A component adds a browser listener repeatedly and never removes old subscriptions.

## Rule
Every externally registered listener has one matching cleanup path.

## Implementation
Register listeners inside a synchronization boundary with stable handler identity and deterministic cleanup. Avoid duplicate subscriptions caused by changing render-time closures.

## Verification
Mount, update, unmount, and remount while asserting listener registration does not accumulate.
