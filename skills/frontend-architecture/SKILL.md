---
name: frontend-architecture
description: Establish browser-application module boundaries, dependency direction, feature ownership, and composition rules.
license: MIT
---

# Frontend Architecture

## Purpose

Establish browser-application module boundaries, dependency direction, feature ownership, and composition rules so that features can change independently and shared code earns its reuse. Architecture work on the frontend is mostly dependency-direction work: primitives must not know about features, and features must not know about each other except through deliberate seams.

## Activate when

Use when reorganizing a frontend, introducing feature modules, reducing coupling, or defining shared versus feature-local code.

## Boundary with related skills

- Use `frontend-architecture` for module boundaries, ownership, and dependency direction.
- Use `react-architecture` for the React-specific layering of UI/domain/transport/state within those boundaries.
- Use `frontend-repository-archetypes` first to classify the repository (SPA, Next.js app, monorepo) — architecture decisions follow the archetype.
- Use `react-state-management` when the boundary question is specifically state ownership.

## Repository inspection

Inspect source layout, import graph, route boundaries, state ownership, API clients, UI primitives, dependency cycles, package boundaries, and existing architectural conventions. In monorepos, inspect package/workspace configuration and cross-package import rules before proposing boundaries. Use the repository's own lint rules for import boundaries if configured (e.g. `import/no-restricted-paths`, dependency-cruiser).

## Decision framework

Organize around stable domain or user capabilities rather than arbitrary technical folders when repository evidence supports it. Keep dependencies flowing from reusable primitives toward feature composition, not the reverse.

Dependency direction contract:

```
platform/ (browser APIs, env)      — depends on nothing app-specific
  ↑
shared/ui/ (primitives)            — no feature knowledge, no HTTP
  ↑
shared/data/ (API clients, schemas) — no UI, no feature policy
  ↑
features/<name>/                   — composes ui + data; owns its policy
  ↑
routes/pages/                      — composes features; owns routing only
```

- Feature-local code may import from anything below it; shared code may never import from a feature.
- Cross-feature needs go through a deliberate seam (event, route, or promoted shared module), never a direct deep import.
- Introduce a boundary only when it reduces a real coupling or lifecycle problem; boundaries have maintenance cost.

## Implementation

- Define explicit ownership for pages, features, components, data access, and shared utilities.
- Keep feature-specific policy out of generic UI primitives.
- Prefer composition over deep inheritance.
- Keep cross-feature dependencies narrow and intentional.

**Reference example** — a feature module with explicit dependency direction and a narrow public surface:

```
src/
  shared/ui/        Button.tsx, Dialog.tsx        # no imports above features
  shared/data/      apiClient.ts, schemas.ts      # fetch + zod; no UI imports
  features/cart/
    api.ts          # uses shared/data; exports Cart operations only
    components/     # CartSummary.tsx uses shared/ui Button
    hooks/          # useCart() — the ONLY cross-feature export
    index.ts        # public surface: { useCart, CartSummary }
  routes/checkout/  # imports features/cart (via index.ts only)
```

```ts
// features/cart/index.ts — the narrow public seam
export { useCart } from "./hooks/useCart";
export { CartSummary } from "./components/CartSummary";
// NOT export * from './internal' — deep internals stay feature-local
```

```ts
// shared/ui/Button.tsx — primitive with zero feature knowledge
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};
export function Button({ variant = "primary", ...rest }: ButtonProps) {
  return <button className={clsx("btn", `btn--${variant}`)} {...rest} />;
}
```

## Failure modes

- Giant `utils/` modules accumulating every helper nobody could place — split by domain or delete.
- God components owning HTTP, policy, and layout in one file.
- Global stores used as an escape hatch for missing prop/composition design.
- Circular feature dependencies hidden behind barrel `index.ts` files re-exporting each other.
- Abstractions created before a second concrete use case exists (premature design system).
- Shared modules importing "just one thing" from a feature — the direction inversion that rots architectures.
- Monorepo packages importing app internals directly instead of via published package APIs.

## Agent review checklist

- [ ] Dependency direction: no shared → feature imports anywhere in the diff.
- [ ] Every module in the diff has one owner type (platform, primitive, data, feature, route).
- [ ] Feature public surfaces are narrow (single entry file, deliberate exports).
- [ ] Cross-feature access goes through a seam, not deep imports.
- [ ] No new boundary introduced without a named coupling/lifecycle problem it solves.

## Verification

Use import/build checks and focused tests to prove behavior survives structural changes. Inspect dependency graphs when tooling exists (`npx depcruise --validate` or the repository's lint rule). For refactors, run the full typecheck and the test suites of every touched feature; add an import-boundary lint rule when introducing a new boundary so the direction survives future changes.

## Source foundation

Feature-oriented structure and dependency-direction rules follow widely documented frontend architecture practice — including the React docs' guidance on component composition (https://react.dev/learn/passing-data-deeply-with-context and https://react.dev/reference/react/createContext) and monorepo/workspace conventions (https://pnpm.io/workspaces, https://turbo.build/repo/docs). Repository conventions should still be inspected before implementation.
