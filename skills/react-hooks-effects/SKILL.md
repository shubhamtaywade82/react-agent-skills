---
name: react-hooks-effects
description: Use when working with React hooks, effects, refs, memoization, subscriptions, or external synchronization.
---

# React Hooks and Effects

## Purpose
Use hooks to express stateful logic and effects specifically for synchronization with systems outside React's render model.

## Activate when
- adding or repairing useEffect/custom hooks;
- handling stale closures or dependency arrays;
- changing useMemo/useCallback/useRef.

## Repository inspection
Inspect hook usage, dependency linting, external subscriptions, timers, async cleanup, and duplicated derived state.

## Decision rules
- Derive values during render when possible.
- Use effects for synchronization with external systems.
- Make cleanup explicit for subscriptions, timers, and cancellable async work.
- Do not suppress dependency lint without a concrete invariant.
- Memoization requires a measured or contract-driven reason.

## Implementation procedure
1. Classify logic as render, event, state transition, or synchronization.
2. Remove unnecessary effects.
3. Define dependency and cleanup semantics.
4. Handle cancellation and response races.
5. Test setup, change, cleanup, and unmount behavior.

## Anti-patterns / failure modes
- effects used for derived state;
- chains of effects simulating workflows;
- missing cleanup;
- refs used as hidden application state;
- blanket useMemo/useCallback.

## Agent review checklist
- Why must this be an effect?
- What external system is synchronized?
- What happens when dependencies change quickly?
- What happens on unmount?

## Verification
Focused hook/component tests, async race/cancellation tests, lint, and typecheck.
