---
name: frontend-styling-layout
description: Build maintainable responsive layout and styling systems with explicit ownership, tokens, and interaction states.
license: MIT
---

# Frontend Styling & Layout

## Purpose

Styling systems rot through accretion: a second styling model here, a magic z-index there, a fixed width that breaks at the next content change. Maintainable styling means one styling model, design tokens as the only color/spacing/typography vocabulary, layout that flexes with content instead of fighting it, and interaction states (hover, focus-visible, active, disabled, reduced motion) treated as requirements — not decorations added after launch.

## Activate when

- changing CSS, styling architecture, or responsive behavior;
- working with layout systems (flex/grid), themes, or design tokens;
- adding animation or visual state changes;
- fixing overlap, clipping, or stacking issues.

## Boundary with related skills

- Use `react-accessibility` for the accessibility contracts (focus order, ARIA) that interaction states serve.
- Use `react-component-engineering` for the component contracts the styling expresses (variants, states).
- Use `frontend-design-system` when the repo has a component library with its own styling layer.
- Use `react-performance` for render-cost concerns; this skill covers paint/layout cost only where CSS causes it.

## Repository inspection

Inspect the CSS strategy (CSS Modules, utility framework, CSS-in-JS, global sheets), the design-token source (which variables exist, who owns them), breakpoints, browser-support targets, the z-index scale if any, and existing visual-regression tooling. Identify the existing primitives before writing anything new — the decision is usually "use the system", not "add a parallel system".

## Decision rules

- Spacing, typography, color, and motion come from tokens — literal values in components are debt with a diff-able shape.
- Layout constraints are intrinsic: `flex-wrap`, `grid` with `minmax()`/`auto-fit`, `clamp()` for type — content drives size, not viewport assumptions.
- Interaction states are part of the contract: hover, focus-visible (keyboard), active, disabled, and `[aria-busy]` all styled, all from tokens.
- Motion respects `prefers-reduced-motion`; contrast meets WCAG AA (4.5:1 text) at both theme extremes.
- Stacking is explicit: a documented z-index scale (a few named layers), never bare integers; new stacking contexts (`transform`, `opacity`, `isolation`) are called out because they trap positioned children.
- Responsive behavior degrades predictably: mobile-readable by default, enhancement via media queries — and no horizontal page scroll at common widths.

## Implementation procedure

1. Map the requirement onto existing tokens and primitives; list any token gap explicitly (then add the token, not the literal).
2. Build the layout with intrinsic patterns; test at narrow, mid, and wide widths with real content variants (long words, many items, empty state).
3. Style the complete interaction-state set from tokens; verify keyboard focus is visible against every background.
4. Guard animation behind `prefers-reduced-motion`; check contrast in both themes.
5. Keep stacking explicit: named layers only; note any new stacking context.
6. Run visual-regression or component/browser tests for the states; eyeball the degraded viewport.

**Reference example** — intrinsic responsive grid with token-driven, motion-safe cards:

```css
/* Layout flexes with content: no breakpoint list, no fixed widths. */
.card-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
}
.card { padding: var(--space-4); border-radius: var(--radius-md); background: var(--surface-1); }

/* Interaction states are requirements, tokens are the vocabulary. */
.card:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: var(--space-1); }
.card[aria-busy="true"] { opacity: 0.6; pointer-events: none; }

/* Motion respects the user setting; contrast comes from tokens, not literals. */
@media (prefers-reduced-motion: reduce) {
  .card { transition: none; }
}
.card { transition: background-color 150ms ease; }
```

No media queries at all — `auto-fit` + `minmax(min(100%, 18rem), 1fr)` adapts from one column to many with real content, and every value above is a token or a token-composed constraint.

## Anti-patterns / failure modes

- Fixed widths / `overflow: hidden` band-aids — content breaks or bugs go invisible.
- Animation added without a `prefers-reduced-motion` guard — vestibular harm, and a review finding every time.
- Focus indicators removed "for cleanliness" or invisible against theme backgrounds.
- Bare z-index integers — the 9999 escalation war, then a new stacking context traps everything.
- Literal hex/px values bypassing tokens — theme switching silently misses them.
- A second styling model introduced without a documented migration need — two sources of truth forever.
- Media-query layouts that assume today's content — break at the next content change, not the next viewport.

## Agent review checklist

- Do all values come from tokens (any literals justified)?
- Does the layout survive long words, empty states, and item-count extremes?
- Are focus-visible, hover, active, disabled, busy states all styled and keyboard-visible?
- Is animation gated on reduced-motion, and contrast AA in both themes?
- Are z-index values from the named scale, and are new stacking contexts flagged?

## Verification

Component/browser tests for interaction states and focus behavior; visual-regression runs where the repo provides them; manual pass at narrow/mid/wide with stress content; contrast checks in both themes; reduced-motion spot-check; confirm no horizontal page scroll at 360–400px widths.
