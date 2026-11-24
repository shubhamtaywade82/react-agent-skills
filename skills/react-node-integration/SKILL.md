---
name: react-node-integration
description: Use when React/TypeScript client code talks to a Node.js backend or BFF — consuming typed API contracts, sending credentials and CSRF tokens from fetch, mapping problem-details error envelopes into forms, streaming SSE or WebSocket updates into components, and co-owning the client side of the seam with node-agent-skills.
license: MIT
---

# React ↔ Node Integration

## Purpose

Own the client side of the contract between a React/TypeScript client and a Node.js backend (or BFF) so neither side assumes what the other sends. The server side of each contract belongs to `node-agent-skills` (its seam skill `node-react-integration` owns the server fit: topology, contract generation, CORS, CSRF, cookies, error envelopes, pagination, streaming); this skill owns the client side and the fit between the two. This skill activates only when the detected backend is a Node.js service or BFF (a separate `package.json` with an HTTP framework — Express, Fastify, NestJS, Hono — excluding Next.js/Remix/TanStack Start route handlers, which this pack owns internally).

## Composing with node-agent-skills

This pack never copies Node.js server guidance. For a full-stack Node + React change, split the work:

- Server side (API routes, auth middleware, CORS/CSRF configuration, problem-details responses, SSE/WebSocket servers, pagination headers): `node-agent-skills` → `node-react-integration`.
- Client side (fetch calls, typed response validation, error mapping, forms, live-update hooks, pagination UI): this skill.

If node-agent-skills is not installed, finish the client work and report the Node-side follow-up and its owning skill (`node-react-integration` for the seam; `node-api-engineering` / `node-auth-security` / `node-websockets` etc. for the domain) instead of improvising server guidance.

## Activate when

- a component, hook, or client service calls a Node.js backend or BFF;
- a change touches the client/server boundary: request/response types, auth headers, cookies, CSRF, CORS-triggered credential mode, error envelopes, pagination, or live updates (SSE/WebSocket);
- the Node backend changes its API contract and the client needs a matching update.

## Repository inspection

1. Detect the topology: same-origin (Vite dev proxy / reverse proxy), cross-origin (separate origin), or BFF (app server proxies API calls).
2. Locate the client data layer: fetch wrapper, query client (TanStack Query/SWR/RTK Query), generated or hand-written API types, and the contract source (OpenAPI/schema file or generated client).
3. Inspect auth: token vs. cookie sessions, where the token lives (memory only preferred — never localStorage for long-lived tokens), CSRF token delivery, and credential mode.
4. Inspect error handling: does the backend emit RFC 7807 problem details, a custom envelope, or bare HTTP statuses?
5. Confirm exact Node framework and React versions from lockfiles before using version-specific mechanics.

## Decision rules

- Treat every backend response as untrusted input: validate at the boundary before it enters client state. TypeScript types do not validate JSON; a generated client narrows but generated types still assume the server honored the contract.
- Prefer a generated client or schema-derived types over hand-copied interfaces; hand-copied types drift.
- Keep transport types separate from domain/UI types when their invariants differ.
- Credential mode follows the topology: `credentials: "same-origin"` for same-origin/proxy, `"include"` only when the Node backend's CORS allows the exact origin; never ship cookies cross-origin by accident of defaults.
- Bearer tokens live in memory; never persist long-lived tokens in localStorage or pass them in URLs.
- CSRF protection follows the server's choice (double-submit cookie or token header) — mirror it, do not invent a second mechanism.
- Map problem-details (`type`, `title`, `detail`, and application extensions like `errors`) through one shared mapper, not per-component parsing.
- Authentication establishes identity; authorization decisions stay on the server. The client renders; it never decides.
- For SSE/WebSocket, own reconnection, stale-event handling, and cleanup on unmount explicitly.

## Implementation procedure

1. Locate or create the typed fetch/query wrapper: attach auth (cookie credential mode or in-memory token), set `Accept`, and route all responses through the boundary validator.
2. Derive endpoint types from the contract source (generated client, OpenAPI types, or schema); keep them in the transport layer, map to domain types where invariants differ.
3. Implement one problem-details/error-envelope mapper producing UI-ready states (field errors for forms, toasts/banners for the rest).
4. For collections, consume the pagination contract the backend emits (Link headers or envelope fields) and render it without inventing a second scheme.
5. For live data, use the query library's subscription/streaming support or a dedicated hook that handles `EventSource`/WebSocket lifecycle: connect, reconnect with backoff, in-flight cleanup, and stale-response ordering.
6. Add focused tests at the boundary: auth attach, response validation, error mapping, pagination rendering, and hook cleanup on unmount.

## Failure modes

Avoid:
- trusting generated types as runtime validation (a schema drift becomes a UI crash);
- persisting bearer tokens in localStorage or logging auth headers;
- setting `credentials: "include"` without checking the server's CORS allowlist (silent auth failures or cross-origin leaks);
- parsing the error envelope per component (fix the shape once in the mapper);
- ignoring event ordering when reconnecting SSE/WebSocket streams (stale events overwriting newer state);
- leaving `EventSource`/WebSocket connections open after unmount;
- duplicating server authorization checks in the client and treating them as enforcement;
- hand-copied interface drift against a contract that has a generator available.

## Reference example

```tsx
// Node backend emits: RFC 7807 problem details + double-submit CSRF cookie; cookie sessions
type Problem = { type: string; title: string; detail: string; errors?: Record<string, string[]> };

export async function request<T>(input: RequestInfo, init: RequestInit, validate: (u: unknown) => T): Promise<T> {
  const response = await fetch(input, { credentials: "same-origin", ...init,
    headers: { Accept: "application/json", "X-CSRF-Token": csrfFromCookie(), ...init.headers } });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) throw toUiError(response.status, payload as Problem | null); // one mapper
  return validate(payload); // unknown in, validated out — generated types are not validation
}

// Live updates: own the lifecycle explicitly
export function useLiveCounters(url: string) {
  const [counters, setCounters] = useState<Counters | null>(null);
  useEffect(() => {
    const source = new EventSource(url);
    source.onmessage = (event) => setCounters(Counters.parse(JSON.parse(event.data)));
    return () => source.close(); // cleanup on unmount — never leak the stream
  }, [url]);
  return counters;
}
```

## Agent review checklist

- [ ] Every response validated at the boundary before entering client state.
- [ ] Credential mode matches the deployment topology and the server's CORS configuration.
- [ ] Tokens in memory only; no auth material in storage, URLs, or logs.
- [ ] One error-envelope mapper, not per-component parsing.
- [ ] Streaming hooks own reconnection, ordering, and cleanup.
- [ ] Types derived from the contract source, not hand-copied.
- [ ] Node-side follow-up reported when the server contract must change.

## Verification

Typecheck, focused boundary tests (auth attach, response validation, error mapping, pagination, streaming cleanup), and the repository-standard lint/test/build gates. Verify against the backend's actual error envelope, CSRF mechanism, and pagination headers rather than an assumed shape. Report exactly what was verified against the real backend contract and what remains unverified.
