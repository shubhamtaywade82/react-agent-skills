---
name: react-component-engineering
description: Use when designing, implementing, refactoring, or reviewing React component APIs, props, composition, reusable UI boundaries, and component-level contracts.
license: MIT
---

# React Component Engineering

## Purpose

Build components with explicit contracts, predictable composition, and bounded complexity. A component's public API is its props — the review question is whether the API is smaller than the behavior it enables. Components that take a `mode`-plus-twelve-flags shape are asking the caller to run their state machine; components that compose (children, slots, compound parts) let the caller express intent instead.

## Activate when

- creating or refactoring components and their prop contracts;
- replacing prop drilling with composition or slots;
- choosing controlled vs uncontrolled inputs;
- reviewing reusable UI and design-system boundaries.

## Boundary with related skills

- Use `react-state-management` for deciding where a component's state actually lives.
- Use `react-hooks-effects` for the stateful logic inside components.
- Use `frontend-styling-layout` for the styling contract and visual states.
- Use `react-accessibility` for semantic and interaction requirements (focus, roles, labels).
- Use `react-forms-validation` for form-specific component contracts.

## Repository inspection

Inspect local component conventions, the design-system primitives available (do not rebuild them), controlled/uncontrolled patterns already in use, composition APIs (children, render props, slots), variant modeling, and component tests. If a similar component exists, extend its contract rather than shipping a parallel one.

## Decision rules

- Prefer semantic elements and composition over configuration-heavy components; `children` and slots beat `type: "complex-left-aligned"`.
- Keep props minimal and named after intent (`onSelect` not `handleThingCallback`).
- Controlled when the parent owns the source of truth; uncontrolled when ownership is genuinely local — mixing per-prop is a bug.
- Model exclusive states as discriminated variants (`variant: "primary" | "ghost"`), not boolean flags that can co-trigger.
- List identity: stable, domain-derived keys — index keys corrupt reorderable or filtered lists.
- One component, one owner of behavior: a generic control that silently performs network calls is two components welded together.

## Implementation procedure

1. State the observable behavior ("renders the selected option; calls `onSelect` once per change").
2. Model the prop contract: data in, events out, slots for composition — nothing else.
3. Separate presentation from domain behavior; the component knows how to render, not where data came from.
4. Implement semantic HTML first; ARIA is a patch, not a foundation.
5. Define interaction/focus behavior (keyboard, focus ring, disabled/aria-busy states).
6. Test meaningful states and interactions, not snapshot plumbing.

**Reference example** — discriminated variants plus compound composition instead of a flag explosion:

```tsx
// BEFORE: boolean soup — invalid combinations compile
<Modal open={open} isConfirm destructive hideFooter showIcon warnFirst />

// AFTER: the variant is the state machine; composition carries the content
type DialogProps =
  | { variant: "info"; title: string; children: ReactNode }
  | { variant: "confirm"; title: string; confirmLabel: string; onConfirm: () => void; children: ReactNode }
  | { variant: "destructive"; title: string; confirmLabel: string; onConfirm: () => void;
      requireText: string; children: ReactNode };

export function Dialog({ variant, title, children, ...rest }: DialogProps) {
  return (
    <Overlay>
      <DialogFrame role="dialog" aria-modal="true" aria-label={title}>
        <DialogHeader title={title} />
        {children}
        {variant !== "info" && (
          <DialogFooter>
            <CancelButton />
            <ConfirmButton
              kind={variant}
              confirmationText={variant === "destructive" ? rest.requireText : undefined}
              onConfirm={variant === "info" ? undefined : rest.onConfirm}
            />
          </DialogFooter>
        )}
      </DialogFrame>
    </Overlay>
  );
}

// Callers compose instead of configuring:
<Dialog variant="destructive" title="Delete project?" confirmLabel="Delete"
        requireText={project.name} onConfirm={destroy}>
  <p>This removes {project.name} for every member.</p>
</Dialog>
```

The destructive variant physically cannot render without its confirmation contract — the invalid states the flag soup allowed are unrepresentable.

## Anti-patterns / failure modes

- Dozens of unrelated props and boolean explosions — the state machine moved into the caller.
- Generic controls performing hidden network calls — presentation welded to data policy.
- Index keys for reorderable/filterable lists — state and DOM attach to the wrong rows.
- Copying a component to tweak one prop — extend the contract or compose instead.
- Implementation-coupled tests asserting internals instead of rendered behavior.

## Agent review checklist

- Is the API smaller than the behavior it enables?
- Can composition replace configuration?
- Is controlled/uncontrolled ownership explicit per prop?
- Are variants discriminated rather than boolean-flagged?
- Is list identity stable and domain-derived?

## Verification

Component tests over meaningful states and interactions (render, select, keyboard, disabled), accessibility assertions (role, label, focus), typecheck (the discriminated contract is compile-checked), lint, and visual/integration checks where the repo provides them.
