---
name: react-design-system
description: Use when creating/changing shared UI primitives, tokens, themes, variants, and design-system composition.
---

# React Design System Engineering

## Purpose
Keep shared UI primitives stable, composable, accessible, and hard to misuse.

## Activate when
- adding shared components;
- changing design tokens/themes;
- introducing variants;
- extending a component library.

## Repository inspection
Inspect component API conventions, styling system, tokens, accessibility primitives, visual regression setup, package boundaries, and consumers.

## Decision rules
- Extract stable repeated behavior, not hypothetical reuse.
- Prefer composition/slots to variant explosions.
- Keep tokens semantic.
- Encode supported states in types where practical.
- Put baseline accessibility in the primitive.
- Avoid leaking styling implementation into product APIs.

## Implementation procedure
1. Identify repeated contract.
2. Define public API and supported states.
3. Implement semantic/accessibility baseline.
4. Add interaction and visual coverage.
5. Migrate real consumers.
6. Check package/bundle impact.

## Anti-patterns / failure modes
- shared components with one consumer;
- hundreds of style props;
- impossible variant combinations;
- accessibility delegated entirely to consumers.

## Agent review checklist
- Is the abstraction stable?
- Are invalid combinations constrained?
- Does the primitive own core accessibility?
- Does the API remain small?

## Verification
Component tests, visual regression where configured, accessibility checks, typecheck, and consumer integration tests.
