---
name: react-server-components
description: Design React Server Components and client boundaries without leaking server-only code or duplicating data ownership.
license: MIT
---

# React Server Components

## Purpose

Design React Server Components and client boundaries without leaking server-only code or duplicating data ownership. The architecture rule is simple to state and easy to violate: server components fetch and render (zero bundle cost), client components own interactivity (full bundle cost), and every value crossing the boundary is a serialized, deliberately shaped contract.

## Activate when

Use when a framework supports Server Components, client/server directives, server-only modules, server actions, or streamed server rendering.

## Boundary with related skills

- Use `react-server-components` for component architecture across the boundary.
- Use `react-server-security` for the security composition (secret disclosure, serialization attacks, dependency patching).
- Use `react-modern-rendering` for streaming/hydration semantics of the boundary.
- Use framework adapters (`nextjs`, `remix`, `tanstack-start`) for framework-specific routing/directive mechanics.

## Repository inspection

Inspect framework and React versions, server and client module boundaries, routing model, data access placement, serialization constraints, bundler configuration, and authentication context. Map the existing layout: which routes are server by default, where client islands begin, and where data access already lives.

## Decision framework

Keep server-only work server-side. Mark client boundaries only where interactivity or browser APIs require them. Treat serialization as an explicit contract.

The boundary decision per component:

| Need | Where it lives |
|---|---|
| Fetching/DB access, secrets, privileged logic | Server component / server-only module |
| `useState`, event handlers, effects, browser APIs | Client component |
| Both (interactive list of server data) | Server parent renders data; client child receives serializable props |
| Large static markup (docs, marketing) | Server component — zero client cost |

- The `"use client"` directive opens an island: everything imported by it ships. Minimize the surface by pushing client boundaries to leaf components.
- `server-only` package (imported in a module) makes any accidental client import a build error — use it for privileged modules instead of comments.
- Server actions are POST endpoints with arguments: they validate input like any untrusted boundary, authenticate per-call, and return serializable results.

## Implementation

- Minimize client boundary surface.
- Keep secrets and privileged data access in server-only modules.
- Pass serializable, intentionally shaped props across boundaries.
- Avoid importing server-only modules into client code.
- Test loading, error, and navigation behavior around streamed or deferred content.

**Reference example** — a server page composing a client island with a server action:

```tsx
// app/products/page.tsx — SERVER component: data access stays here
import { ProductFilter } from "./ProductFilter";      // client island
import { db } from "@/server/db";                     // server-only module
import { deleteProduct } from "./actions";

export default async function ProductsPage() {
  const products = await db.query(ProductTable, { orderBy: desc(createdAt), limit: 50 });
  // Serialize exactly what the island needs — not the ORM row
  const items = products.map((p) => ({ id: p.id, name: p.name, priceCents: p.priceCents }));
  return (
    <section>
      <h1>Products</h1>
      <ProductFilter items={items} onDelete={deleteProduct} />  {/* action passed as prop */}
    </section>
  );
}
```

```tsx
// app/products/ProductFilter.tsx — CLIENT island: only the interactive leaf
"use client";
export function ProductFilter({ items, onDelete }: FilterProps) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => filterBy(items, query), [items, query]);
  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Filter products" />
      <ul>
        {visible.map((p) => (
          <li key={p.id}>
            {p.name} — ${(p.priceCents / 100).toFixed(2)}
            <button onClick={() => onDelete(p.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </>
  );
}
```

```ts
// app/products/actions.ts — server action: untrusted boundary discipline
"use server";
import "server-only";                                  // build error if imported client-side
import { db } from "@/server/db";
import { revalidatePath } from "next/cache";

export async function deleteProduct(productId: string): Promise<ActionResult> {
  const session = await requireSession();              // authenticate EVERY action call
  const parsed = ProductIdSchema.parse(productId);     // validate input — it's a POST arg
  if (!(await canDelete(session, parsed))) return { ok: false, error: "forbidden" };
  await db.delete(ProductTable, { id: parsed });
  revalidatePath("/products");
  return { ok: true };                                 // serializable result only
}
```

```ts
// server/db.ts — privileged module fails loudly on client import
import "server-only";
export const db = createDb(process.env.DATABASE_URL); // secrets never reach the client graph
```

## Failure modes

- Secret leakage: a client component importing a chain that reaches `process.env` secrets — `server-only` guards prevent this by build error, not review.
- Oversized client bundles: `"use client"` at a page/layout level instead of leaf components — the whole tree ships.
- Non-serializable props: functions, class instances, or ORM rows crossing the boundary — build error at best, runtime serialization loss at worst (Dates arrive as strings; Date methods missing).
- Duplicated fetching: server components fetching, then client islands re-fetching the same data because the props weren't shaped right.
- Hydration mismatch: server-rendered timestamps/ids differing from the client pass in the same tree.
- Unsupported browser-only behavior in server modules (`window`, `document` execution at module scope on the server).
- Server actions trusting their arguments (they are public POST endpoints — no auth, no validation = privilege escalation).

## Review

Trace every server and client import boundary and every value crossing it. For each: is the prop deliberately shaped (DTO, not row)? Is the client boundary at the leaf? Does every server action authenticate and validate? Do `server-only` guards exist on privileged modules?

## Verification

Run framework-specific build and type checks that enforce server/client constraints. Exercise server rendering, client hydration, and boundary-specific tests. Specifically: (a) the production build passes with `server-only` guards in place; (b) a boundary-prop test feeds a serialized shape (JSON round-trip) and the island renders; (c) a server-action test calls the action without a session → rejected; (d) bundle report shows the island (not the page) as the client payload.
