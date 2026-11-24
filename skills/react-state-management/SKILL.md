---
name: react-state-management
description: Use when deciding React UI state ownership across component state, useState, reducers, context, and shared stores.
license: MIT
---

# React State Management

## Purpose

Keep state close to the boundary that owns it, and prevent global stores from becoming accidental application databases. Most "state management" problems are ownership problems in disguise: duplicated server state, URL state re-stored in `useState`, derived values mirrored by effects. The repair is a taxonomy — classify every piece of state, give it exactly one owner, and let everything else derive from it.

## Activate when

- adding shared state or choosing between `useState`, reducers, context, and external stores;
- changing context/store patterns or provider scope;
- modeling a complex local workflow (multi-step, invariant-bearing);
- reconciling stale state across consumers.

## Boundary with related skills

- Use `react-data-fetching` for server-state caching/revalidation (server state is cache, not source of truth).
- Use `react-hooks-effects` for the mechanics of stateful hooks; this skill for ownership and placement.
- Use `react-routing` for URL-owned state (deep-linkable filters, tabs, pagination).
- Use `react-component-engineering` for the component contracts the state feeds.

## Repository inspection

Inventory local state, contexts (provider scope, value size, render fan-out), reducers, external stores, server-state/cache layers, persisted state, URL state, and cross-feature consumers. For each item ask: who writes it, who reads it, what derives from it, what happens on navigation or logout.

## Decision rules

- Classify first: local UI state, derived values, URL state, server cache, durable client state — each has a natural owner.
- Local concerns stay local (`useState` in the owning component); lifting is a cost, not a default.
- Use reducers when transitions have invariants (`count` never negative, at most one selected item) or multi-field actions; `useState` for independent leaf values.
- Context propagates environment (theme, locale, session identity, dependency injection) — it is not a global store; giant context values re-render every consumer on every change.
- Server state lives in a data/cache layer; duplicating it into app state creates a second, stale source of truth.
- URL is the owner for shareable, reload-surviving state — storing it in `useState` too is duplication that drifts.
- One source of truth per fact; everything else derives during render.

## Implementation procedure

1. Classify every item: local UI, derived, URL, server cache, or durable client state.
2. Assign ownership to the narrowest boundary that serves all consumers.
3. Model complex transitions as explicit reducer actions; keep invariants in one place (the reducer).
4. Keep read boundaries narrow: selectors or context splitters so consumers subscribe to what they use.
5. Reconcile stale state deliberately: logout/navigation resets, cache invalidation points, and migration of persisted shapes.
6. Test transitions (reducer unit tests) and cross-consumer outcomes (integration tests).

**Reference example** — a reducer owning invariants, scoped context, narrow consumption:

```tsx
// The reducer is the single state machine: invariants live here, nowhere else.
type CartState = { items: { id: string; qty: number }[] };
type CartAction =
  | { type: "add"; id: string; qty: number }
  | { type: "remove"; id: string }
  | { type: "clear" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const existing = state.items.find((i) => i.id === action.id);
      const qty = Math.max(1, action.qty);                      // invariant: qty >= 1
      const items = existing
        ? state.items.map((i) => (i.id === action.id ? { ...i, qty: i.qty + qty } : i))
        : [...state.items, { id: action.id, qty }];
      return { items };                                          // invariant: no duplicate ids, by construction
    }
    case "remove":
      return { items: state.items.filter((i) => i.id !== action.id) };
    case "clear":
      return { items: [] };
  }
}

// Context propagates the store to the subtree; the VALUE is split so
// action-only consumers don't re-render on every state change.
const CartStateContext = createContext<CartState | null>(null);
const CartActionsContext = createContext<CartActions | null>(null);

export function useCartItems(): CartState {
  const ctx = useContext(CartStateContext);
  if (ctx === null) throw new Error("useCartItems outside <CartProvider>");  // narrow, explicit contract
  return ctx;
}
```

URL-owned state for the catalog view (`?page=2&q=shoes`) reads and writes the URL directly — no parallel `useState` copy, so share links and reloads are correct by construction.

## Anti-patterns / failure modes

- Duplicated server state in app stores — two copies, one stale, both rendered somewhere.
- Giant context values (whole app state in one provider) — every change re-renders every consumer.
- Global state for one-screen concerns — scope creep that survives refactors forever.
- Effects mirroring state between stores (`useEffect(() => setB(a))`) — two owners, guaranteed drift.
- Derived values stored instead of computed — selection count, totals, filtered lists are render derivations.
- Persisted state read back without validation or migration — last month's shape crashes today's reducer.
- Missing logout/navigation reset — the next user sees the previous session's cart.

## Agent review checklist

- What owns this state, and is it the narrowest owner that serves all consumers?
- Can a consumer derive it instead of storing it?
- If it is global/contextual, why — what crosses that boundary?
- How is stale state reconciled (logout, navigation, invalidation)?
- Do transitions with invariants go through one reducer?

## Verification

Reducer unit tests over valid and invalid transitions (invariants hold), integration tests across consumers (provider scope, context splitting), typecheck, and render-count checks when provider/store scope changes (React DevTools profiler or a render-count fixture).
