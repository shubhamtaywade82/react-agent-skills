---
name: typescript-type-design
description: Use when modeling TypeScript domain states, discriminated unions, generics, branded identifiers, utility types, or reusable APIs.
license: MIT
---

# TypeScript Type Design

## Purpose

Encode domain invariants in types without making the type system accidental architecture. A well-modeled type turns a class of runtime bugs into compile errors; an over-modeled type turns every consumer into a type gymnast. The craft is knowing which invariants actually matter.

## Activate when

- adding domain types;
- replacing flag combinations;
- defining reusable generic APIs;
- distinguishing structurally identical primitives.

## Repository inspection

Inspect existing exported types, naming, strict nullity, generated contracts, and utility-type conventions. If the domain type already exists (generated from schema, or exported by a sibling module), derive from it instead of re-declaring a parallel shape.

## Decision rules

- Model mutually exclusive states with discriminated unions.
- Use brands only where accidental mixing is materially risky.
- Use generics for real relationships.
- Prefer narrow object types when keys are known.
- Derive small variants from stable types.
- Separate transport/domain/UI types when invariants differ.

Modeling ladder — try in order, stop at the first rung that proves the invariant:

```
1. literal + union            type Status = "open" | "paid" | "shipped"
2. discriminated union        one `kind` field makes states mutually exclusive
3. optional fields per state  fields only valid in that state (with satisfies checks)
4. branded primitive          UserId = string & { readonly __brand: "UserId" }
5. generic relationship       Result<T, E> — only when T and E genuinely co-vary
```

## Implementation procedure

1. Write the valid-state table.
2. Identify discriminants/shared fields.
3. Define nullability and ownership.
4. Add compile-time contract examples.
5. Add runtime tests for serialized/user-controlled values.

**Reference example** — the ladder applied to an order domain, from flags to unions to brands:

```ts
// BEFORE: flag soup — invalid states are representable
interface OrderFlags {
  paid: boolean;
  shipped: boolean;
  cancelled: boolean;      // paid && cancelled && shipped compiles fine
}

// AFTER rung 2: the valid-state table, one row per member
type Order =
  | { status: "open"; items: Item[]; placedAt: Date }
  | { status: "paid"; items: Item[]; paidAt: Date; paymentId: PaymentId }
  | { status: "shipped"; items: Item[]; paidAt: Date; paymentId: PaymentId;
      shippedAt: Date; tracking: TrackingCode }
  | { status: "cancelled"; items: Item[]; reason: string; cancelledAt: Date };
// paymentId exists ONLY on members that paid; narrowing makes invalid access a compile error

// Compile-time contract example: proves narrowing works the way consumers need
type Ship = Extract<Order, { status: "shipped" }>;
const assertTracking = (o: Ship): TrackingCode => o.tracking;   // compiles
// @ts-expect-error — cancelled orders have no tracking
const badTracking = (o: Extract<Order, { status: "cancelled" }>): TrackingCode => o.tracking;

// Rung 4 — brand only where mixing is materially risky (IDs crossing wires)
declare const brand: unique symbol;
export type UserId = string & { readonly [brand]: "UserId" };
export type OrderId = string & { readonly [brand]: "OrderId" };
export const asUserId = (raw: string): UserId => {
  if (!USER_ID_RE.test(raw)) throw new InvalidIdError("user", raw);
  return raw as UserId;    // single, validated construction point
};
function getUser(id: UserId) { /* ... */ }
// @ts-expect-error — OrderId is not assignable, the swap is a compile error
getUser(asOrderId(raw));
```

```ts
// Boundary discipline: runtime validation guards the untrusted edge,
// the domain type is compile-time only
const WireOrder = z.object({ status: z.enum(["open", "paid", "shipped", "cancelled"]), /* ... */ });
const fromWire = (raw: unknown): Order => OrderDomain.parse(raw);   // unknown → domain
```

## Anti-patterns / failure modes

- Overlapping union members (two members both carrying `status: "paid"` — narrowing picks one arbitrarily and the bug hides).
- `Partial<T>` as a domain model — every field optional means no invariant at all; `Partial` is for updates, not states.
- Brands everywhere (branded strings for values that never mix add ceremony without safety).
- Generic abstractions hiding the actual API (`Flatten<DeepPartial<Order>>` in a public signature nobody can read).
- Structurally identical primitives left bare where cross-wiring is materially likely (`userId`/`orderId` both plain `string` in a function taking both).
- Transport types reused as domain types — API schema constraints (all-nullable, stringly-typed dates) leaking into business logic.
- Declaring domain types by hand when the schema generates them — drift guaranteed.

## Verification

Typecheck-focused tests, exported API compilation checks, and runtime boundary tests. Concretely: (a) each union member's exclusive fields compile only under its discriminant (`@ts-expect-error` contract examples checked in CI via `tsc`); (b) branded construction has exactly one validated entry point; (c) the boundary test feeds malformed wire data (`status: "paid"` without `paymentId`) and asserts rejection.

## Source foundation

- Narrowing: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
- Discriminated unions: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
- Generics: https://www.typescriptlang.org/docs/handbook/2/generics.html
- Branding technique (nominal typing discussion): https://github.com/microsoft/TypeScript/pull/33038
