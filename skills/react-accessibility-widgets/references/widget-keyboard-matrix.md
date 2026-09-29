# Composite Widget Keyboard Matrix

Use this reference when implementing or changing keyboard behavior for a composite ARIA widget.

| Widget | Core keyboard behavior to verify |
| --- | --- |
| Dialog | Tab/Shift+Tab containment as required, Escape close, focus restore |
| Menu / menu button | Enter/Space open, Arrow navigation, Escape close, focus return |
| Tabs | Arrow navigation, Home/End, activation model, selected state |
| Listbox | Arrow navigation, Home/End, selection model, type-ahead when supported |
| Combobox | Input editing, popup navigation, Escape, Enter, active option exposure |
| Grid / treegrid | Roving focus or active descendant, Arrow navigation, Home/End, selection |
| Tree | Arrow navigation, expand/collapse, Home/End, selection |
| Toolbar | Roving focus, Arrow navigation, Tab entry/exit |
| Disclosure / popover | Enter/Space toggle, Escape dismissal where applicable, focus semantics |

## Rules

Prefer the native element semantics available for the interaction. Apply the WAI-ARIA Authoring Practices pattern matching the widget; do not invent custom key maps.

Verify both keyboard behavior and state attributes such as `aria-expanded`, `aria-selected`, `aria-controls`, `aria-activedescendant`, or `aria-current` where applicable.
