# TypeScript Intentional Export Surface

## Problem
A module's public API grows accidentally because internal helpers are re-exported through a barrel.

## Rule
Treat exports as a versioned contract.

## Implementation
Export only intentional public names. Keep internal helpers private and avoid barrels that import broad dependency graphs.

## Verification
Test the published/imported surface and check declaration output when declarations are generated.
