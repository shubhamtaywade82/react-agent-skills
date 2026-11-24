---
name: react-accessibility
description: Use for semantic HTML, accessible names, keyboard navigation, focus management, forms, dialogs, live regions, and custom widget accessibility.
license: MIT
---

# React Accessibility

## Purpose

Make accessibility a first-class behavioral contract for every interactive feature. Accessibility is not a compliance pass at the end — the accessible name, role, keyboard path, and focus lifecycle are part of the component's API, decided when it is built.

## Activate when

- adding/changing interactive UI;
- building dialogs, menus, tabs, comboboxes, or custom controls;
- fixing keyboard, focus, or screen-reader issues.

## Boundary with related skills

- Use `react-accessibility` for semantics, names, keyboard, and focus contracts.
- Use `react-accessibility-widgets` when building a specific composite widget (dialog, tabs, combobox) with full keyboard semantics.
- Use `react-testing-engineering` to prove the contract (role/name queries, keyboard tests).
- Use `react-async-ui` for async status announcements (live regions for loading/error states).

## Repository inspection

Inspect semantic structure, existing accessible primitives, focus utilities, design-system components, and accessibility test tooling (jest-axe, eslint-plugin-jsx-a11y). A design-system dialog with correct focus management wins over a hand-rolled one.

## Decision rules

- Prefer native HTML semantics before ARIA: `<button>`, `<a href>`, `<label>`, `<fieldset>` come with role, name, and keyboard behavior for free.
- Every interactive control needs an accessible name and keyboard operability.
- Do not add ARIA that contradicts native semantics (`role="button"` on a `<div>` still misses Enter/Space handling — the native element already does both).
- Define focus entry, movement, and restoration for transient UI (dialogs, menus, drawers): where focus lands on open, how Tab cycles, where it returns on close.
- Expose errors and important status changes programmatically (`aria-live` for status, `aria-describedby` for field errors) without excessive announcements.

## Implementation procedure

1. Start with semantic HTML.
2. Define keyboard behavior (list the keys, match the APG pattern for the widget).
3. Define focus lifecycle (entry → trap/movement → restoration).
4. Add only necessary ARIA.
5. Test accessible name, role, state, keyboard, and focus behavior.

**Reference example** — a dialog with the full focus contract, versus the broken version it replaces:

```tsx
// BROKEN: clickable div, no name, no keyboard, focus lost on close
<div className="overlay" onClick={onClose}>
  <div className="dialog">{children}</div>
</div>

// CORRECT: native semantics, focus entry/trap/restoration, named controls
import { useRef, useEffect } from "react";

export function Dialog({ open, onClose, title, children }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement;
    panelRef.current?.focus();                          // entry
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab") return;                      // simple focus trap
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
      if (!focusables?.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      restoreFocusRef.current?.focus();                 // restoration
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="dialog-title"
        tabIndex={-1} className="dialog panel"
      >
        <h2 id="dialog-title">{title}</h2>
        {children}
        <button type="button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
```

Proving it:

```tsx
test("dialog moves focus in, restores it on close, and closes on Escape", async () => {
  const user = userEvent.setup();
  const opener = renderOpener();                    // button that opens the dialog
  await user.click(screen.getByRole("button", { name: "Open settings" }));

  const dialog = screen.getByRole("dialog", { name: "Settings" });  // role + name verified
  expect(dialog).toHaveFocus();

  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(opener).toHaveFocus();                     // restoration verified
});
```

## Anti-patterns / failure modes

- Clickable divs/spans;
- focus lost after a dialog closes (no restoration target);
- invisible focus indicators (`outline: none` without replacement);
- ARIA used to repair incorrect semantics instead of the right element;
- live regions for every visual update (announcement fatigue);
- `aria-label` overriding a visible label with different text (name/visible-label mismatch);
- form errors rendered visually only — screen-reader users submit blind into failures.

## Agent review checklist

- [ ] Can keyboard-only users complete the task (keys listed, matched to the APG pattern)?
- [ ] Every control has an accessible name (visible label, aria-label, or aria-labelledby)?
- [ ] Focus entry, movement, and restoration defined for transient UI?
- [ ] Role matches the element semantics, and ARIA adds state rather than replacing semantics?
- [ ] Errors and async status announced via live region or describedby?

## Verification

Use role/name assertions, keyboard/focus tests (see the dialog test above), automated accessibility checks where configured (`jest-axe` for violations, `eslint-plugin-jsx-a11y` in lint), and manual browser checks for complex widgets. Run the repository's full test suite.

## Source foundation

- WAI-ARIA Authoring Practices (keyboard and focus patterns for dialogs, menus, tabs, comboboxes): https://www.w3.org/WAI/ARIA/apg/
- MDN Accessibility: https://developer.mozilla.org/en-US/docs/Web/Accessibility
- WCAG 2.2 (including 2.4.3 Focus Order, 4.1.2 Name/Role/Value): https://www.w3.org/WAI/WCAG22/

Repository conventions should still be inspected before implementation.
