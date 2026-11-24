---
name: typescript-module-design
description: Design TypeScript module boundaries, dependency direction, exports, and composition without accidental cycles or barrel sprawl.
license: MIT
---

# TypeScript Module Design

## Purpose

Module boundaries are the architecture a refactor can actually see: files and exports define what couples to what, in which direction. Good module design keeps public surfaces narrow, dependency direction explicit (UI → features → shared, never sideways or backwards), and import graphs acyclic by construction — because a cycle turns every lazy-loading and tree-shaking promise into a lie and makes initialization order a runtime lottery.

## Activate when

- reorganizing modules or package boundaries;
- designing exports, import graphs, or shared code placement;
- hunting circular dependencies or initialization-order bugs;
- wiring path aliases, workspace boundaries, or package `exports`.

## Boundary with related skills

- Use `typescript-configuration` for the `paths`/`moduleResolution` settings that aliases ride on.
- Use `typescript-build-architecture` for project references and composite build graphs.
- Use `typescript-public-api-design` for the type-level shape of the exported surface.
- Use `react-architecture` for the feature-layer conventions these modules serve.

## Repository inspection

Inspect module format (ESM/CJS), `tsconfig` paths vs package `exports`, workspace boundaries, barrel files (`index.ts` re-export fans), dependency cycles (run a cycle detector — `npx madge --circular src` or `dpdm` — never infer from folder names), and import-direction lint rules (`eslint-plugin-import`, `eslint-plugin-boundaries`). Read the actual graph: the folder layout is a claim, the imports are the fact.

## Decision rules

- Public surfaces are narrow and deliberate: export what consumers need, `export type` for type-only re-exports, nothing internal leaks by convenience.
- Dependency direction is a written rule, enforced by linting — e.g. `shared/` may not import from `features/` or `ui/`.
- Barrels are earned: an aggregation module pays only when it reduces real coupling; a barrel that fans every leaf into every importer kills tree-shaking and hides cycles.
- Package `exports` (the real boundary for published/workspace packages) stay consistent with runtime resolution; editor-only `paths` aliases that the bundler disagrees with are latent breakage.
- Side-effect-bearing modules are named as such and imported explicitly — import order in a cycle decides runtime behavior, silently.
- Cycles are build errors, not warnings: detect them continuously, fix by extracting the shared concept downward.

## Implementation procedure

1. Draw the real import graph (cycle detector output, not folder intuition).
2. Define layer direction and encode it in import-boundary lint rules.
3. Split the public surface from internals per module (`index.ts` exports only the contract; internals stay unexported).
4. Break cycles by moving the mutually-needed concept down a layer — the cycle is a missing module.
5. Align aliases/`exports` with what the runtime actually resolves; verify from a real entry, not the typecheck alone.
6. Test the boundaries: a module-focused test importing only public surface fails if internals leak.

**Reference example** — the `exports` boundary and a cycle break:

```jsonc
// packages/orders/package.json — the REAL public surface (importable ≠ exported)
{
  "name": "@app/orders",
  "exports": {
    ".":          "./src/index.ts",      // public API: the contract only
    "./testing":  "./src/testing.ts"     // explicit, named test-support surface
  }
}
```

```ts
// src/index.ts — narrow by construction
export type { Order, OrderStatus } from "./domain";     // type-only re-export: zero runtime cost
export { placeOrder, cancelOrder } from "./api";
// createOrderTable, priceCalc, transformers — NOT exported: internals
```

```txt
Cycle found: ui/OrderCard → features/orders/selectors → features/cart/api → ui/OrderCard
Fix: both features read the same "current tenant currency" helper.
Move it DOWN a layer: features/shared/currency.ts — direction restored, cycle gone.
```

The fix for a cycle is almost never "delete an import" — it is recognizing the mutually-needed concept and giving it a lower home.

## Anti-patterns / failure modes

- Hidden cycles that typecheck clean but break lazy-loading, tree-shaking, or initialization order at runtime.
- Editor-only path aliases the bundler resolves differently — works in dev, fails in build.
- Accidental public APIs via mega-barrels — internals become load-bearing for other teams.
- Side-effect imports (`import "./register-widgets"`) hidden inside a barrel, executing in an order nobody chose.
- Circular re-exports in `index.ts` — the module that finally evaluates wins, nondeterministically across bundlers.
- Folder-based reasoning ("it's in shared/, it must be shared") instead of graph-based verification.

## Agent review checklist

- Does the import graph match the intended direction, verified by tooling?
- Is the public surface narrow — do internals stay unexported?
- Do barrels reduce coupling, or just fan out imports?
- Are aliases consistent between editor, typecheck, and bundler?
- Were cycles fixed by extracting a lower-layer module, not by deleting an import?

## Verification

Run typecheck, build, and the cycle detector (`madge --circular` / `dpdm`) as gates; run import-boundary linting for direction rules; exercise a runtime entry (bundler build or Node run) to confirm resolution matches the config; module-focused tests import the public surface only.
