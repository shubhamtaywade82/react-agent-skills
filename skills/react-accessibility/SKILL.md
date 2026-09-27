---
name: react-accessibility
description: Use for semantic HTML, accessible names, keyboard navigation, focus management, forms, dialogs, live regions, and custom widget accessibility.
---

# React Accessibility

## Purpose
Make accessibility a first-class behavioral contract for every interactive feature.

## Activate when
- adding/changing interactive UI;
- building dialogs, menus, tabs, comboboxes, or custom controls;
- fixing keyboard, focus, or screen-reader issues.

## Repository inspection
Inspect semantic structure, existing accessible primitives, focus utilities, design-system components, and accessibility test tooling.

## Decision rules
- Prefer native HTML semantics before ARIA.
- Every interactive control needs an accessible name and keyboard operability.
- Do not add ARIA that contradicts native semantics.
- Define focus entry, movement, and restoration for transient UI.
- Expose errors and important status changes programmatically without excessive announcements.

## Implementation procedure
1. Start with semantic HTML.
2. Define keyboard behavior.
3. Define focus lifecycle.
4. Add only necessary ARIA.
5. Test accessible name, role, state, keyboard, and focus behavior.

## Anti-patterns / failure modes
- clickable divs/spans;
- focus lost after a dialog closes;
- invisible focus indicators;
- ARIA used to repair incorrect semantics;
- live regions for every visual update.

## Agent review checklist
- Can keyboard-only users complete the task?
- What is the accessible name?
- What happens to focus on open/close/error?
- Is the role actually correct?

## Verification
Use role/name assertions, keyboard/focus tests, automated accessibility checks where configured, and manual browser checks for complex widgets.

## Source foundation
- WAI-ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- MDN Accessibility: https://developer.mozilla.org/en-US/docs/Web/Accessibility
