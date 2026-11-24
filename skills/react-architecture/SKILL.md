---
name: react-architecture
description: Use when shaping React application architecture, feature boundaries, module ownership, composition, and shared abstractions.
license: MIT
---

# React Architecture

## Purpose

Keep React systems understandable by assigning clear ownership to UI, domain, transport, state, and infrastructure. React gives composition primitives; architecture decides what composes what. The recurring failure is a component that owns rendering, data fetching, business policy, and layout at once.

## Activate when

- introducing feature/module structure;
- moving components or business logic;
- creating shared hooks/services/components;
- deciding local versus shared ownership.

## Boundary with related skills

- Use `react-architecture` for React-specific layering (UI/domain/transport/state) within modules.
- Use `frontend-architecture` for the application-level module boundaries and dependency direction.
- Use `react-state-management` when the decision is which state layer owns a given value.
- Use `react-data-fetching` / `tanstack-query` for the transport layer's implementation.

## Repository inspection

Inspect source boundaries, route modules, feature folders, API clients, state stores, design-system primitives, import direction, and test placement. In app-router repositories (Next.js, Remix, TanStack Start), note the framework's own boundaries (server components, route loaders) — they constrain where each layer may live.

## Decision rules

- Prefer feature-oriented boundaries when behavior changes together.
- Keep transport details out of reusable UI components.
- Keep domain rules out of presentation when they can be tested independently.
- Reuse an existing abstraction before creating a parallel one.
- Extract shared abstractions only for stable repeated contracts.
- Prevent circular dependencies by making ownership explicit.

Layering test for any component: if you delete its JSX, what remains should be a pure function of props; if you delete its hooks, the JSX should still render given props. Components that fail both tests own too much.

## Implementation procedure

1. Identify the feature boundary.
2. Define UI/domain/transport/state responsibilities.
3. Confirm dependency direction.
4. Keep public APIs narrow.
5. Co-locate tests where convention supports it.
6. Extract only after behavior is stable.

**Reference example** — one feature sliced by layer, with a container component that composes but does not decide:

```tsx
// features/checkout/domain.ts — pure, independently testable
export type Cart = { items: CartItem[]; coupon?: Coupon };
export function totalFor(cart: Cart, pricing: Pricing): Money {
  const subtotal = cart.items.reduce((sum, i) => sum.add(pricing.priceOf(i)), Money.zero());
  return cart.coupon ? cart.coupon.applyTo(subtotal) : subtotal;
}

// features/checkout/transport.ts — the only place fetch lives
export async function submitOrder(cart: Cart): Promise<OrderId> {
  const response = await api.post("/orders", { items: cart.items, coupon: cart.coupon?.id });
  return parse(OrderIdSchema, response).id; // unknown in, validated out
}

// features/checkout/CheckoutSummary.tsx — presentation: props in, JSX out
export function CheckoutSummary({ cart, total, onSubmit, pending }: Props) {
  return (
    <section aria-labelledby="checkout-heading">
      <h2 id="checkout-heading">Order summary</h2>
      <ul>{cart.items.map((i) => <li key={i.id}>{i.name}</li>)}</ul>
      <Button onClick={onSubmit} disabled={pending}>
        {pending ? "Placing order…" : `Pay ${total.format()}`}
      </Button>
    </section>
  );
}

// features/checkout/CheckoutContainer.tsx — composes domain + transport + UI
export function CheckoutContainer({ cart }: { cart: Cart }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<Error | null>(null);
  const total = useMemo(() => totalFor(cart, currentPricing), [cart]);
  const submit = () => startTransition(async () => {
    try { await submitOrder(cart); } catch (e) { setError(e as Error); }
  });
  return <CheckoutSummary cart={cart} total={total} onSubmit={submit} pending={pending} />;
}
```

## Anti-patterns / failure modes

- Global utils buckets;
- components owning HTTP, policy, and layout together;
- duplicated business rules;
- premature design-system extraction;
- circular imports hidden behind barrel files;
- context providers wrapping the entire app to avoid passing props two levels (prefer explicit props and targeted context);
- server-component boundaries leaking client-only state upward, forcing `"use client"` at the root.

## Agent review checklist

- [ ] Who owns this behavior — one answer per module.
- [ ] Can this feature change independently (no sibling imports)?
- [ ] Are shared abstractions stable (used by 2+ features with consistent contracts)?
- [ ] Is dependency direction obvious from the file layout alone?
- [ ] Does every component pass the layering test?

## Verification

Typecheck, focused tests (domain functions get unit tests; containers get interaction tests), relevant build path, and import-boundary checks for major refactors. For extraction changes, run the consuming features' tests to prove the public surface did not regress.
