---
name: redux
description: Apply Redux or Redux Toolkit conventions for store boundaries, slices, selectors, middleware, and serialization only when Redux is detected.
---

## Activate when
Activate only when Redux packages or store setup is present.

## Repository inspection
Inspect store configuration, slices, middleware, RTK Query usage, selectors, serializability checks, persistence, and existing feature boundaries.

## Decision framework
Keep state global only when multiple distant consumers or durable workflow requirements justify it. Prefer local React state for local ownership.

## Implementation
- Keep reducers pure.
- Use explicit actions and selectors.
- Keep non-serializable values out of state unless the repository has a deliberate exception.
- Separate server cache concerns when RTK Query or another query layer owns them.

## Failure modes
Watch for global-state creep, selector overuse, duplicated server data, mutable reducer logic, and persistence of sensitive values.

## Review
Check state ownership, action boundaries, selector stability, and middleware effects.

## Verification
Run reducer/selector tests and user-visible integration tests through the real store.
