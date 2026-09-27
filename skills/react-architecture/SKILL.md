---
name: react-architecture
description: Use when shaping React application architecture, feature boundaries, module ownership, composition, and shared abstractions.
---

# React Architecture

## Purpose
Keep React systems understandable by assigning clear ownership to UI, domain, transport, state, and infrastructure.

## Activate when
- introducing feature/module structure;
- moving components or business logic;
- creating shared hooks/services/components;
- deciding local versus shared ownership.

## Repository inspection
Inspect source boundaries, route modules, feature folders, API clients, state stores, design-system primitives, import direction, and test placement.

## Decision rules
- Prefer feature-oriented boundaries when behavior changes together.
- Keep transport details out of reusable UI components.
- Keep domain rules out of presentation when they can be tested independently.
- Reuse an existing abstraction before creating a parallel one.
- Extract shared abstractions only for stable repeated contracts.
- Prevent circular dependencies by making ownership explicit.

## Implementation procedure
1. Identify the feature boundary.
2. Define UI/domain/transport/state responsibilities.
3. Confirm dependency direction.
4. Keep public APIs narrow.
5. Co-locate tests where convention supports it.
6. Extract only after behavior is stable.

## Anti-patterns / failure modes
- global utils buckets;
- components owning HTTP, policy, and layout together;
- duplicated business rules;
- premature design-system extraction;
- circular imports hidden behind barrel files.

## Agent review checklist
- Who owns this behavior?
- Can this feature change independently?
- Are shared abstractions stable?
- Is dependency direction obvious?

## Verification
Typecheck, focused tests, relevant build path, and import-boundary checks for major refactors.
