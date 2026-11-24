---
name: frontend-networking
description: Engineer browser networking around request contracts, cancellation, retries, caching, CORS, timeouts and observability.
license: MIT
---

# Frontend Networking

## Purpose

Engineer browser networking as a contract, not a collection of fetch calls: every request has an identity, a timeout, a cancellation path, an error classification, and a validation boundary. Most "the API is flaky" bugs are frontend networking bugs — retried POSTs, unvalidated JSON, swallowed aborts, or CORS misread as server errors.

## Activate when

Activate for fetch/XHR, API clients, retries, timeouts, CORS, request cancellation, upload/download or network middleware.

## Boundary with related skills

- Use `frontend-networking` for the transport layer mechanics (client, retry, timeout, CORS).
- Use `react-data-fetching` / `tanstack-query` for the server-state caching layer built on top.
- Use `typescript-runtime-contracts` for schema validation of responses.
- Use `react-node-integration` / `react-rails-integration` when the specific backend's contract semantics (problem details, CSRF, pagination) matter.
- Use `frontend-debugging` when diagnosing a failing request.

## Repository inspection

Inspect transport client (custom wrapper, generated client, or raw fetch), base URL config, authentication (token placement, credential mode), cache layer, retry policy, timeout behavior, request IDs and error normalization. Note where the base client lives and extend it rather than adding parallel one-off fetch calls.

## Decision rules

- Validate untrusted responses: parse every response through a schema before it enters state; `unknown` in, typed out.
- Make cancellation and retry policy explicit — a request without `AbortController` is a state-corruption bug waiting for a slow network.
- Do not retry non-idempotent operations blindly: POST retries need idempotency keys or server dedup; GET retries are safe with backoff.
- Classify errors before rendering them: DNS/network, timeout, 4xx (client), 5xx (server), abort (ignore — a newer request owns the UI), malformed payload, and CORS (setup error, not a server outage).
- One error model across the app; normalize at the client boundary, not per component.

## Implementation contract

request identity → timeout/abort → transport → status classification → schema validation → domain error

Preserve server error semantics across UI boundaries.

**Reference example** — a typed client with timeout, abort, retry, and classification in one place:

```ts
type DomainError =
  | { kind: "network" }                          // DNS, connection reset
  | { kind: "timeout" }
  | { kind: "client"; status: number; body: unknown }
  | { kind: "server"; status: number; requestId?: string }
  | { kind: "malformed"; detail: string }
  | { kind: "cors" };

export async function apiFetch<T>(
  path: string,
  { timeoutMs = 8000, retries = 0, signal, schema }: Options<T>,
): Promise<T> {
  const attempt = async (remaining: number): Promise<T> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(new TimeoutError()), timeoutMs);
    signal?.addEventListener("abort", () => controller.abort(signal.reason), { once: true });
    try {
      const response = await fetch(`${baseUrl()}${path}`, {
        ...options,
        credentials: "same-origin",
        signal: controller.signal,
      });
      const payload: unknown = await response.json().catch(() => null);
      if (response.ok) return schema.parse(payload);        // unknown in, validated out
      if (response.status >= 500 && remaining > 0) {
        await backoff(retries - remaining);                  // only idempotent paths pass retries > 0
        return attempt(remaining - 1);
      }
      throw toDomainError(response.status, payload);
    } catch (error) {
      if (signal?.aborted) throw error;                      // caller cancelled: propagate, don't classify
      if (controller.signal.aborted && !signal?.aborted) throw { kind: "timeout" };
      if (isCorsError(error)) throw { kind: "cors" };
      if (remaining > 0) return attempt(remaining - 1);
      throw { kind: "network" };
    } finally {
      clearTimeout(timeout);
    }
  };
  return attempt(retries);
}

// Usage: timeout, no blind retry (POST), schema validation
const order = await apiFetch("/orders", {
  method: "POST",
  schema: OrderSchema,
  timeoutMs: 10000,       // submissions wait longer than reads
  retries: 0,             // non-idempotent — never auto-retry
});
```

## Failure handling

Classify DNS/network, timeout, 4xx, 5xx, abort, malformed payload and CORS failures separately. Render each class by its user meaning: network/timeout → retryable; 4xx → user-actionable; 5xx → "try later" with request ID for support; abort → no UI change (a newer request owns the screen); malformed → log with request ID, fail loudly in dev; CORS → route to a setup error page, not a spinner.

## Failure modes

- Unvalidated `response.json()` flowing straight into `setState` — one backend schema drift becomes a runtime crash.
- Retrying POST without idempotency keys — duplicate orders, double charges.
- Abort swallowed into an error UI — stale-response cancellation showing "Something went wrong" over fresh content.
- Timeouts absent — a hung request pins a spinner forever; combined with missing abort, it corrupts state on input change.
- CORS failures rendered as server outages — misdirected incident reports.
- Per-component `fetch` wrappers with diverging error shapes — the same failure rendering three different ways.
- Auth tokens in URLs (query params logged by proxies/CDNs) instead of headers.

## Review

Check sensitive headers, credential mode, retries, cache, idempotency and telemetry. Confirm one client boundary owns classification and validation, and that no component parses raw responses.

## Agent review checklist

- [ ] Every request has timeout + abort wired to the owning component's lifecycle.
- [ ] Responses schema-validated before entering state.
- [ ] Retries restricted to idempotent requests (or idempotency-keyed).
- [ ] Abort distinguished from network error in the UI.
- [ ] One error model, one normalization point (the client, not components).
- [ ] Sensitive headers/credentials only where the contract allows; no tokens in URLs.

## Verification

Test success, timeout, abort, retryable/non-retryable errors, malformed response and auth expiry. Include a race test: response resolves after input change → no state corruption. Mock at the network boundary (MSW/fetch stub), assert classification outputs, and run the repository's typecheck.
