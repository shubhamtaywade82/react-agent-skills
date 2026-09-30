---
name: react-component-engineering
description: Use when designing, implementing, refactoring, or reviewing React component APIs, props, composition, reusable UI boundaries, and component-level contracts.
---

# React Component Engineering

## Purpose
Build components with explicit contracts, predictable composition, and bounded complexity.

## Activate when
- creating/refactoring components;
- designing props;
- replacing prop drilling;
- reviewing reusable UI.

## Repository inspection
Inspect local component conventions, styling approach, design-system primitives, controlled/uncontrolled patterns, composition APIs, and tests.

## Decision rules
- Prefer semantic elements and composition over configuration-heavy components.
- Keep props minimal and named after intent.
- Use controlled state when the parent owns the source of truth.
- Use uncontrolled state when ownership is genuinely local.
- Use discriminated variants when states are exclusive.
- Use stable identity for list keys.

## Implementation procedure
1. Define observable behavior.
2. Model the prop contract.
3. Separate presentation from domain behavior.
4. Implement semantic HTML.
5. Define interaction/focus behavior.
6. Test meaningful states and interactions.

## Anti-patterns / failure modes
- dozens of unrelated props;
- boolean-prop explosions;
- generic controls performing hidden network calls;
- index keys for reorderable lists;
- implementation-coupled tests.

## Agent review checklist
- Is the API smaller than the behavior it enables?
- Can composition replace configuration?
- Is source-of-truth ownership explicit?
- Is identity stable?

## Verification
Component tests, accessibility assertions, typecheck, lint, and relevant visual/integration checks.
