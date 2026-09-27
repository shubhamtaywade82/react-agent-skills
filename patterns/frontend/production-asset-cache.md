# Production Asset Cache Contract

## Problem
A deployment serves HTML that references assets from a different release.

## Rule
Immutable assets and mutable entry documents need distinct cache semantics.

## Implementation
Use content-addressed assets when supported, keep HTML/config cache policy explicit, and define the invalidation/rollback behavior.

## Verification
Build two revisions and verify asset references and cache behavior across a release boundary.
