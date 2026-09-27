# TypeScript Module Cycle Boundary

## Problem
Two feature modules import each other through convenience exports.

## Rule
Dependency direction should be explicit and acyclic.

## Implementation
Extract the narrow shared contract or move the dependency to the owning boundary. Do not solve cycles with dynamic imports unless runtime semantics require them.

## Verification
Run typecheck/build and inspect the actual import graph for cycles.
