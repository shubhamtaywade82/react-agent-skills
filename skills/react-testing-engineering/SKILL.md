---
name: react-testing-engineering
description: Use when testing React components, hooks, forms, async UI, user interactions, accessibility, and integration boundaries.
---

# React Testing Engineering

## Purpose
Test observable UI contracts and state transitions while minimizing implementation coupling.

## Activate when
- adding/repairing React tests;
- testing async UI or user interactions;
- replacing brittle selectors or mocks.

## Repository inspection
Inspect test runner, DOM environment, Testing Library setup, network mocking, fake timers, accessibility checks, coverage policy, and CI.

## Decision rules
- Prefer user-observable assertions.
- Prefer role/name/label queries.
- Use realistic interaction APIs such as user-event when available.
- Mock stable external boundaries, not React internals by default.
- Synchronize async work explicitly.
- Test rejection and recovery.

## Implementation procedure
1. Identify the user-visible contract.
2. Choose the smallest proving boundary.
3. Control external dependencies.
4. Exercise realistic interaction.
5. Assert UI and meaningful side effects.
6. Add regression coverage.

## Anti-patterns / failure modes
- private-state assertions;
- class-name selectors for semantics;
- arbitrary sleeps;
- snapshot-only tests;
- mocking every child.

## Agent review checklist
- Would this survive a harmless refactor?
- Is async behavior deterministic?
- Does it prove user behavior?
- Are failure/recovery paths covered?

## Verification
Run focused tests, integration tests as needed, typecheck, lint, and the repository's standard suite.

## Source foundation
- Testing Library: https://testing-library.com/docs/
- user-event: https://testing-library.com/docs/user-event/intro/
