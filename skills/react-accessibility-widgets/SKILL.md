---
name: react-accessibility-widgets
description: Implement composite ARIA widgets with APG-aligned semantics, keyboard interaction, focus management, selection state and accessible naming.
---

# React Accessibility Widgets

## Activate when

Activate for dialog, menu, menu button, tabs, tablist, combobox, listbox, tree, treegrid, grid, toolbar, tooltip, disclosure, popover or similar composite widgets.

## Repository inspection

Inspect native HTML alternatives, current accessibility primitives, focus utilities, widget state model and browser test setup.

## Decision rules

Prefer native elements when they already provide the required semantics. When a composite widget is necessary, use the WAI-ARIA Authoring Practices pattern appropriate to the widget.

Do not invent keyboard conventions.

## Implementation contract

Define:
- semantic role/name;
- focus entry and restoration;
- roving tabindex or active-descendant strategy;
- keyboard map;
- selection/expanded state;
- disabled/hidden semantics.

Keep DOM structure stable enough for focus and assistive technology behavior.

## Failure handling

Test escape, arrow keys, home/end, tab order, focus restoration, nested widgets and disabled items according to the selected pattern.

## Review

Check accessible name, role/state/property accuracy, keyboard behavior, focus visibility and screen-reader-observable structure.

## Verification

Use accessibility assertions plus keyboard-driven browser tests for every composite widget interaction path.


## Progressive disclosure

Read `references/widget-keyboard-matrix.md` when implementing or changing keyboard behavior for a composite widget.
