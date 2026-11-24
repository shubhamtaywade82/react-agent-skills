---
name: typescript-migration
description: Execute incremental TypeScript migrations with compatibility boundaries, strictness preservation, and measurable cleanup.
license: MIT
---

# TypeScript Migration

## Purpose

Migrate JavaScript to TypeScript — or migrate strictness, types, or module systems — in bounded, reviewable, reversible slices that preserve runtime behavior first and improve type precision second. A migration that lands as one giant "converted the repo" commit converts nothing: it hides new `any`s under old bugs, and its temporary suppressions become permanent residents. The deliverable is a trend line (errors trending down, strictness trending up, debt counted), not a big-bang.

## Activate when

- converting JavaScript to TypeScript file-by-file or package-by-package;
- upgrading TypeScript or tightening strictness flags;
- replacing legacy types (`any`, unsafe casts) with real contracts;
- migrating module systems (CJS → ESM) — compose with `typescript-version-migration` for release-specific deprecations.

## Boundary with related skills

- Use `typescript-version-migration` for major-version upgrades (removed flags, lib changes, tooling compatibility).
- Use `typescript-configuration` for the `allowJs`/`checkJs`/strictness config the migration rides on.
- Use `typescript-runtime-contracts` for `unknown` + validation at boundaries that were previously typed by trust.
- Use `typescript-module-design` when the migration also redraws module boundaries.

## Repository inspection

Measure the baseline: type-error count under the target strictness, which files are JS vs TS, current `allowJs`/`checkJs`/`strict` settings, generated code that must be excluded or typed, test coverage over high-risk runtime boundaries (parsing, storage, API seams — the code whose behavior a migration must not change), and the build/CI wiring that will enforce the ratchet.

## Decision rules

- Bounded vertical slices over repository-wide rewrites: one module or package per PR, compiling green, shippable alone.
- Runtime behavior first, type precision second — a migration PR that changes behavior is a bug, whatever the types say.
- No mass `any`-casts or suppression comments to "finish" a slice: `unknown` + boundary validation is the honest conversion; every `@ts-expect-error` carries a reason and a tracking note.
- Ratchet explicitly: baseline counts recorded, error-count budgets per directory, `--noImplicitAny` enabled per package as it converts.
- Temporary shims (compat types, loose interfaces) are removed in the same series of PRs as the slices they enabled — tracked in a list, not in folklore.
- Generated code is excluded or typed at its generator, never hand-patched — the next generation erases hand edits.

## Implementation procedure

1. Record the baseline: error count under target config, `any` count, suppression count, per-directory.
2. Choose the first slice: a leaf module with good test coverage (the migration's safety net), not the scariest core file.
3. Convert the slice: rename to `.ts`/`.tsx`, type the boundaries with `unknown` + validation where data enters, run the tests.
4. Tighten the ratchet for the slice's scope (per-package strict config, error budget) before merging.
5. Land reviewable PRs (slice-sized), removing any shim the slice obsoleted in the same PR series.
6. Re-measure and report the trend in each PR description — debt must move in one direction only.

**Reference example** — the ratchet config and one slice's boundary conversion:

```jsonc
// tsconfig.json — migrate by narrowing excludes, not by weakening flags
{
  "compilerOptions": { "strict": true, "noImplicitAny": true, "allowJs": true, "checkJs": true },
  "exclude": ["src/legacy/**/*.js"]     // shrinks every slice; strict floor never moves
}
```

```ts
// BEFORE (legacy JS): the API seam was typed by trust
export function loadCart(id) {
  return fetch(`/api/carts/${id}`).then((r) => r.json());   // caller guesses the shape
}

// AFTER (slice): unknown at the boundary, real types inside
import { z } from "zod";
const CartSchema = z.object({ id: z.string(), items: z.array(z.object({ sku: z.string(), qty: z.number() })) });
export type Cart = z.infer<typeof CartSchema>;

export async function loadCart(id: string): Promise<Cart> {
  const res = await fetch(`/api/carts/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`loadCart failed: ${res.status}`);
  return CartSchema.parse(await res.json());    // conversion may not introduce unvalidated trust
}
```

Each landed slice moves three numbers: legacy-file count −1, validated-boundary count +1, suppression count +0. The trend is the migration's status report.

## Anti-patterns / failure modes

- The big-bang conversion PR — unreviewable, reverts as one unit, hides behavior changes.
- `as any` / `@ts-ignore` campaigns that make the typecheck green while preserving every runtime bug.
- Type-only fixes that leave runtime bugs — the test suite, not the compiler, proves behavior preserved.
- Enabling `strict` for migrated files while a global `any` escape hatch quietly undermines the rest.
- Permanent suppression debt: `@ts-expect-error` with no reason, no owner, no tracking issue.
- Hand-editing generated types — erased on the next generation, silently.
- Declaration drift after module-system moves: `.d.ts`, `exports` maps, and emit shapes must move with the code.

## Agent review checklist

- Is the slice bounded, green, and shippable alone?
- Did any runtime behavior change (tests prove equivalence)?
- Are new suppressions zero — or each justified, owned, and tracked?
- Did the ratchet tighten for the slice's scope (budgets, excludes shrunk)?
- Were the shims this slice obsoleted removed in the same series?
- Does the PR report the measured trend?

## Verification

Run typecheck (target config), full test suite, lint, and build. Report migration metrics: remaining JS files, error count under target strictness, suppression count — each trending in the right direction. For module-system moves, verify a real runtime entry resolves (not just the typecheck).
