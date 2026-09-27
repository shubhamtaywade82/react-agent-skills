# Dependency Upgrade Isolation

## Problem
A package upgrade pulls unrelated dependency churn into a feature change.

## Rule
Dependency changes must be attributable and reviewable.

## Implementation
Separate behavioral upgrades from unrelated cleanup, preserve the lockfile strategy, and verify peer/version constraints before editing application code.

## Verification
Run install, typecheck, tests, lint, build, and dependency-diff inspection.
