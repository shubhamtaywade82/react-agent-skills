---
name: frontend-styling-layout
description: Build maintainable responsive layout and styling systems with explicit ownership, tokens, and interaction states.
---

## Activate when
Use when changing CSS, styling architecture, responsive behavior, layout systems, themes, animations, or visual states.

## Repository inspection
Inspect CSS strategy, design tokens, utility framework, CSS Modules, CSS-in-JS, component library, breakpoints, browser support, and existing visual regression tooling.

## Decision framework
Prefer existing styling primitives and tokens. Keep layout constraints local to the owning component or design-system layer. Avoid introducing a second styling model without a documented migration need.

## Implementation
- Model spacing, typography, color, and motion through existing tokens.
- Preserve keyboard focus, reduced-motion behavior, contrast, and touch targets.
- Use responsive constraints that degrade predictably.
- Keep z-index and stacking contexts explicit.
- Avoid selector coupling across unrelated components.

## Failure modes
Watch for fixed widths that break content, hidden overflow that masks bugs, animation that ignores reduced motion, and visual state changes that are inaccessible.

## Review
Check responsiveness, focus visibility, contrast, layout shifts, stacking, and consistency with the existing design system.

## Verification
Use component/browser tests for interaction states and visual regression tooling when the repository provides it.
