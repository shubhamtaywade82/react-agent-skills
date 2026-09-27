# TypeScript Isolated Configuration Change

## Problem
A compiler option fixes one project but silently changes every project inheriting the same base config.

## Rule
Change the narrowest configuration owner.

## Implementation
Compare effective tsconfig values across projects, then place the option at the smallest correct scope. Keep dev/test/build semantics aligned.

## Verification
Run all affected project typechecks and at least one production-mode build.
