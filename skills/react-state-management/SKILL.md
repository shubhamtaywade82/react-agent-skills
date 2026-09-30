---
name: react-state-management
description: Use when deciding React UI state ownership across component state, useState, reducers, context, and shared stores.
---

# React State Management

## Purpose
Keep state close to the boundary that owns it and prevent global stores from becoming accidental application databases.

## Activate when
- adding shared state;
- changing context/store patterns;
- modeling complex local workflows.

## Repository inspection
Inventory local state, contexts, reducers, external stores, server-state libraries, persisted state, URL state, and cross-feature consumers.

## Decision rules
- Prefer local state for local UI concerns.
- Use reducers when transitions are complex or invariants matter.
- Use context for dependency/context propagation, not by default as a global store.
- Keep server state in a data/cache layer.
- Establish one source of truth.

## Implementation procedure
1. Classify state as local UI, derived, URL, server, or durable client state.
2. Assign ownership.
3. Model transitions explicitly.
4. Keep selectors/read boundaries narrow.
5. Test transitions and observable outcomes.

## Anti-patterns / failure modes
- duplicated server state;
- giant context values;
- global state for one-screen concerns;
- effects mirroring state between stores.

## Agent review checklist
- What owns this state?
- Can it be derived?
- Why must it be global?
- How is stale state reconciled?

## Verification
Transition tests, integration tests across consumers, typecheck, and performance checks when provider/store scope changes.
