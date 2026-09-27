# React Server Client Boundary

## Problem
A client component imports code that should remain server-only.

## Rule
Server-only dependencies and secrets must not cross into a client bundle.

## Implementation
Trace imports and data flow from server entrypoints into client boundaries. Pass only intentional serializable values.

## Verification
Run framework build checks and inspect client output when sensitive or large server-only dependencies are involved.
