---
name: typescript-public-api-design
description: Design stable public TypeScript APIs and exported contracts for libraries, packages, and shared application modules without coupling API design to release mechanics.
license: MIT
---

# TypeScript Public API Design

## Activate when

Use when adding or changing exported types, package APIs, shared component contracts, SDKs, or module boundaries.

## Boundary with related skills

- Use `typescript-public-api-design` for the shape and stability of exported contracts.
- Use `typescript-type-design` for the internal domain modeling those contracts carry.
- Use `typescript-runtime-contracts` for runtime validation at API boundaries (declarations do not validate).
- Use `typescript-package-publishing` for the release mechanics (versions, publish pipeline) — a separate concern.

## Repository inspection

Inspect package boundaries, exports, declaration generation, semver policy, tsconfig, module format, existing public types, and API compatibility tests. List what is exported today before changing it — the public API is what consumers import, not what you intend them to import.

## Decision framework

Prefer small explicit contracts. Separate input, output, and internal types when their lifecycles differ. Use discriminated unions for variants and avoid exporting incidental implementation details.

The export decision per symbol:

| Symbol kind | Export? |
|---|---|
| Consumer-facing type/function | Yes — documented, stable, semver-tracked |
| Input contract (options/params) | Yes — but never a re-export of an internal type |
| Output contract | Yes — shape derived, not the storage row |
| Internal helper / detail type | No — re-export lazily via `ReturnType<T>` when truly needed |
| Accidental deep import path | No — `exports` map in package.json blocks deep imports |

- Types are the API's documentation surface: required versus optional fields, nullability, and union members are read as behavior promises by consumers.
- Compatibility is structural AND semantic: renaming a field's meaning without changing its shape breaks every consumer that read the old meaning — semver exists to carry that signal.

## Implementation

- Keep public names intentional and stable.
- Document required versus optional semantics.
- Avoid leaking framework-private or transport-specific types through general APIs.
- Make generic parameters earn their place.
- Preserve backward compatibility unless a breaking change is explicit.
- Keep runtime validation separate from compile-time declarations.

**Reference example** — a public API with an explicit exports surface and compatibility contract:

```ts
// index.ts — the ONLY sanctioned import surface
export { createClient, type Client, type ClientOptions, type Result, type ApiError } from "./client";
export { Cache, type CacheConfig } from "./cache";
// NOT: export * from "./internal" — barrel re-exports leak everything

// client.ts — input/output/internal separated by lifecycle
export interface ClientOptions {        // INPUT: stable, additive-only evolution
  baseUrl: string;
  timeoutMs?: number;                    // optional = later additions stay compatible
  retries?: RetryPolicy;
}

export type Result<T> =                  // OUTPUT: derived, not the raw transport row
  | { ok: true; value: T }
  | { ok: false; error: ApiError };

interface Client {                       // public facade over internals
  get<T>(path: string, schema: Schema<T>): Promise<Result<T>>;
  close(): void;
}

// Internal types stay file-local; consumers get derived handles when needed:
export type ApiError = { status: number; code: string; requestId: string };
```

```jsonc
// package.json — exports map blocks accidental deep imports and pins the surface
{
  "name": "@acme/api-client",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" }
    // no "./client" entry: dist/client.js is unreachable by design
  }
}
```

Compatibility check ritual (for every public change):

```ts
// test/api-compatibility.test.ts — old call shapes must keep compiling
const client = createClient({ baseUrl: "https://api.example.com" });   // no options beyond baseUrl
const result = await client.get("/orders", OrderSchema);
if (!result.ok) { console.error(result.error.code); }                  // error fields still there

// Additive change (minor): new OPTIONAL field — old calls above still compile
// Breaking change (major): new REQUIRED field or renamed export — bump major, migrate consumers
```

## Failure modes

- Widening exports accidentally — an `export *` barrel turning every internal refactor into consumers' breaking change.
- Relying on structural compatibility for semantically distinct values (`{ id: string }` from two different domains互换) — compiles, corrupts.
- Deprecated aliases as a permanent substitute for migration — deprecation without a removal date is a lie; consumers never move.
- Leaking framework-private types (ORM entities, framework contexts) through general APIs — every consumer's dependency graph inherits the framework.
- Input types evolving by adding REQUIRED fields — every existing call site breaks at once, silently classified "minor".
- Deep imports from unpublished paths — consumers depend on layout; any refactor is breaking.
- Generic parameters without relationships (`get<T>(path: string): T`) — a cast disguised as an API.

## Review

Check exports (intentional, minimal, one sanctioned surface), declaration output (`.d.ts` builds clean; no unresolvable types), dependency direction (public API does not import consumer-land), versioning implications (additive = minor; shape/semantic break = major), and downstream call-site impact (compatibility test compiles old shapes).

## Verification

Run declaration/typecheck builds and focused consumer tests where available. Exercise old and new call shapes when compatibility is required. Concretely: (a) `tsc` emits declarations with no errors; (b) the compatibility test compiles and passes against the previous version's call shapes; (c) a scratch consumer imports ONLY from the package name (deep import fails against the `exports` map); (d) `npm pack` + install the tarball — types resolve.
