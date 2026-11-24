---
name: typescript-api-contracts
description: Use when a React app consumes or defines HTTP, RPC, GraphQL, websocket, or generated API contracts, and transport, domain, validation, error, pagination, or compatibility boundaries must be explicit.
license: MIT
---

# TypeScript API Contracts

## Purpose

Make the seam between the server and the browser an explicit, validated contract instead of a pile of casts. Server data is untrusted input that happens to usually look like the documented schema: transport types describe what the wire can send, domain types describe what the app can rely on, and runtime validation is the only thing that connects them. Error semantics — retryable versus terminal versus permission — are part of the contract, not an afterthought squeezed into a generic error type.

## Activate when

- defining request, response, error, or pagination types for an API call;
- consuming generated TypeScript from OpenAPI/GraphQL schemas;
- deciding where runtime validation guards untrusted responses;
- normalizing non-success responses without erasing status or correlation identifiers;
- expressing idempotency, version compatibility, or partial-nullable fields at the boundary.

## Repository inspection

Inspect API client code, generated types, OpenAPI/GraphQL sources, runtime validators, error envelopes, auth/session assumptions, pagination conventions, caching layers, and versioning. If generated types exist, treat them as the transport shape — derive domain types from them after validation rather than re-declaring a parallel truth.

## Decision rules

- Keep transport types distinct from domain types whenever server data is untrusted or transformed in transit.
- Generated TypeScript is a compile-time aid, never runtime proof — the schema may have changed since generation.
- Validate at exactly one boundary (the client entry point), not at every consumer.
- Error envelopes must preserve retryability, status, and correlation identifiers; classify retryable (timeout, 429, 503), terminal (400, 404, 422), and permission (401, 403) differently.
- Pagination is part of the contract: cursor vs offset, total-vs-hasMore, and empty-page shape are explicit.
- Mutations declare idempotency semantics (idempotency key, safe-to-retry) so transport retries cannot double-apply.
- Version compatibility is observable: unknown-field tolerance (forward compatible) and required-field additions (breaking) are decided, not accidental.

## Implementation procedure

1. Write the wire shape from the API source of truth (schema, generated types, or documented responses).
2. Define the error envelope: discriminated by class (retryable/terminal/permission), carrying status and correlation ID.
3. Write the runtime validator for responses at the client entry point; parse, don't cast.
4. Derive the domain type from the validated output (`z.infer`), so schema drift surfaces as a type error at the validator.
5. Add contract fixtures covering success, invalid, unauthorized, forbidden, conflict, rate-limit, and server-error responses.

**Reference example** — one endpoint's contract, from wire to domain to errors:

```ts
import { z } from "zod";

// TRANSPORT: what the wire can send (nullable, loose — matches the documented schema)
const OrderWire = z.object({
  id: z.string(),
  status: z.string(),                       // wire is stringly; domain narrows
  totalCents: z.number().int(),
  placedAt: z.string(),                     // ISO string on the wire, Date in domain
  promoCode: z.string().nullable(),         // explicit null, not absent
});
export type OrderWire = z.infer<typeof OrderWire>;

// DOMAIN: what the app may rely on, produced only through the validator
export type Order = {
  id: string;
  status: "open" | "paid" | "shipped" | "cancelled";
  totalCents: number;
  placedAt: Date;
  promoCode: string | null;
};

// ERROR ENVELOPE: retryable vs terminal vs permission stay distinct
export type ApiError =
  | { class: "retryable"; status: 429 | 503 | 0; correlationId: string; retryAfterMs?: number }
  | { class: "terminal"; status: 400 | 404 | 409 | 422; correlationId: string; detail: string }
  | { class: "permission"; status: 401 | 403; correlationId: string };

// THE BOUNDARY: parse, don't cast — unknown never becomes Order without passing here
export async function fetchOrder(id: string): Promise<Order> {
  const res = await fetch(`/api/orders/${encodeURIComponent(id)}`);
  if (!res.ok) throw await toApiError(res);          // normalize without erasing status/correlation
  const wire = OrderWire.parse(await res.json());    // throws with the drift location on schema change
  return {
    ...wire,
    status: parseStatus(wire.status),                // string → union, once, at the edge
    placedAt: new Date(wire.placedAt),
  };
}
```

Generated clients (OpenAPI/GraphQL codegen) replace step 1's hand-written wire type — keep the validator, because generation time and server deploy time are different moments.

## Anti-patterns / failure modes

- Casting responses into domain types (`res.json() as Order`) — schema drift reaches production as undefined-field bugs.
- One generic `ApiError { message: string }` that erases retryable-vs-terminal and forces callers to string-match.
- Inferring authorization from UI state — the UI hiding a button is not a permission decision; the server 403 is.
- Letting fetch/axios "simplify" non-2xx into a generic rejection that drops status and correlation identifiers.
- Nullable and absent treated as interchangeable — `promoCode: null` and missing `promoCode` are different wire facts.
- Retrying non-idempotent mutations without an idempotency key — the retry double-applies.
- Regenerating client types without re-running the validator tests — generation-time and deploy-time schemas drift.

## Verification

Contract fixtures or contract tests per response class: success parses into the domain type; invalid payloads fail the validator with a precise error; unauthorized/forbidden/rate-limit/server-error map to the right envelope class with status and correlation preserved; pagination boundaries (empty page, last page, malformed cursor) hold; a mocked schema-drift response fails at the validator, not in a component.

## Source foundation

- Fetch API and response/status handling: https://developer.mozilla.org/en-US/docs/Web/API/fetch
- Zod runtime validation and `z.infer`: https://zod.dev
- OpenAPI Specification (contract source of truth): https://spec.openapis.org/oas/latest.html
- GraphQL learning resources (schema-first contracts): https://graphql.org/learn/
