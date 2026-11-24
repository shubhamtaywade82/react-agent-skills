---
name: typescript-runtime-contracts
description: Use when untrusted JSON, HTTP responses, environment values, browser storage, or dynamic JavaScript enters typed TypeScript code.
license: MIT
---

# TypeScript Runtime Contracts

## Purpose

Keep compile-time declarations and runtime truth separate. A type annotation is a claim; runtime data owes you nothing. Untrusted values — HTTP bodies, query parameters, `localStorage`, `import.meta.env`/`process.env`, `JSON.parse` output, `contentWindow` data — must cross a validation boundary that parses (not casts) before application code treats them as trusted. One deliberate boundary beats scattered `if` checks, and validation failures are their own error class, distinct from transport failures.

## Activate when

- consuming HTTP/JSON responses or message payloads;
- parsing environment variables or browser storage on read-back;
- processing dynamic JavaScript values (`unknown`, `any`, `JSON.parse`, external script globals);
- adding schema or serialization contracts around generated types.

## Boundary with related skills

- Use `typescript-api-contracts` for the full client/server seam: error envelopes, pagination, idempotency, version compatibility.
- Use `typescript-configuration` when the untrusted value is a compiler/config flag rather than runtime data.
- Use `browser-security-dom-safety` when the value can reach a DOM/URL/message sink (security framing).
- Use `typescript-type-design` for the trusted domain types that live inside the boundary.

## Repository inspection

Inspect transport clients, generated types, validation libraries (`zod`, `valibot`, hand-rolled guards), error normalization, storage access sites, and logging/redaction. Find every place `JSON.parse`, `as`, `!`, or a bare fetch result flows into typed code — those are candidate boundaries. Check whether validation is centralized or repeated per consumer.

## Decision rules

- `unknown` is the default type for untrusted values — `any` opt-outs are a boundary skipped.
- Validate once at a deliberate boundary, then pass trusted domain data inward; re-validating everywhere means the boundary was never real.
- Generated types describe expected data; they do not prove runtime data — pair them with a validator that shares the schema source.
- Validation failures and transport failures are distinct classes with distinct handling (drift vs outage).
- Record the schema-drift location in the validation error — debugging silent `undefined` fields is the cost of skipping this.
- Redact sensitive values before logging malformed payloads; the failure case is exactly when over-logging happens.

## Implementation procedure

1. Locate the trust boundary and name it (a function, a module — one entry point per source).
2. Define the accepted runtime shape with a schema; derive the domain type from the schema, not from a parallel interface.
3. Parse and validate; return a discriminated result or throw a typed boundary error carrying the drift location.
4. Normalize transport representation (string dates → `Date`, nullable → optional) after validation, once.
5. Test malformed, missing, unexpected-extra, and version-drift input; assert caller recovery.

**Reference example** — two boundaries: environment parsing and storage read-back:

```ts
import { z } from "zod";

// 1. Environment: stringly everything — parse at startup, once, fail fast.
const Env = z.object({
  API_URL: z.string().url(),
  FEATURE_FLAGS: z.string().default("").transform((s) => new Set(s.split(",").filter(Boolean))),
  SESSION_TTL_MINUTES: z.coerce.number().int().positive(),
});
const parsed = Env.safeParse(import.meta.env);
if (!parsed.success) throw new Error(`Invalid environment: ${parsed.error.message}`);
export const env = parsed.data;   // the only trusted configuration object in the app

// 2. Storage: what persisted last month may not match today's schema — validate on read.
const DraftSchema = z.object({ id: z.string(), updatedAt: z.string(), body: z.string() });
export function loadDraft(key: string): Draft | null {
  const raw = localStorage.getItem(key);
  if (raw === null) return null;
  const result = DraftSchema.safeParse(JSON.parse(raw));   // JSON.parse result is unknown, always
  return result.success ? toDomain(result.data) : (purgeCorrupt(key), null);
}
```

The pattern is identical for both: `unknown` in, schema in the middle, trusted domain type out, and a defined answer for the invalid case (fail fast at startup, degrade gracefully at read-back).

## Anti-patterns / failure modes

- Blind casts on network responses (`await res.json() as Order`) — schema drift reaches production as undefined-field bugs.
- Validation scattered through UI components — no single boundary, drift found by whichever component crashes first.
- Logging full invalid payloads — the validation path is where tokens and personal data leak.
- Treating generated types as runtime validation — generation time and serve time are different moments.
- `JSON.parse(localStorage…)` trusted because "we wrote it" — last month's schema, an extension, or a past XSS wrote it too.
- A parallel hand-written interface drifting from the schema — derive the type from the schema.

## Agent review checklist

- Is the trust boundary explicit and single per source?
- Is external data validated before narrowing?
- Are validation and transport errors distinguishable at call sites?
- Is sensitive data redacted in the failure path?
- Does a schema change surface as a boundary error, not a component crash?

## Verification

Boundary tests for valid, malformed, missing-field, unexpected-extra, and version-drift payloads; assert the caller's behavior after validation failure (typed error vs graceful degrade) and that the error names the drift location. Include storage/env cases with stale-schema data.

## Source foundation

- TypeScript narrowing and `unknown`: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/intro.html
- Zod schema validation and `safeParse`: https://zod.dev
