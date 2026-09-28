---
name: xstate
description: Apply XState conventions for explicit finite state machines, actors, events and async workflow transitions when XState is present.
---

# XState Adapter

## Activate when

Activate only when XState machines/actors are present or explicitly chosen.

## Repository inspection

Inspect machine definitions, states/events, actors, guards, invoked services and React bindings.

## Decision rules

Model business workflow states explicitly rather than recreating a machine with scattered booleans. Keep events meaningful and transitions deterministic.

## Implementation contract

state → event → transition/guard → effect/actor → next state.

## Failure handling

Handle rejected actors, invalid transitions, stale actors and cleanup on unmount.

## Review

Check reachable states, event completeness and actor lifecycle.

## Verification

Test state/event behavior and integration at the React boundary.
