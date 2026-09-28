---
name: jotai
description: Apply Jotai conventions for atom scope, derived atoms, async atoms and state ownership when Jotai is present.
---

# Jotai Adapter

## Activate when

Activate only when Jotai is installed and used.

## Repository inspection

Inspect atom definitions, provider scopes, derived atoms and async patterns.

## Decision rules

Keep atoms focused on explicit state ownership. Avoid turning every local value into an atom.

## Implementation contract

state owner → atom → derived/async atom → consumer. Keep provider scope intentional.

## Failure handling

Watch for hidden global state, circular atom dependencies and stale async atoms.

## Review

Check ownership, atom scope, derived state and testability.

## Verification

Run focused atom/component tests and repository typecheck/lint.
