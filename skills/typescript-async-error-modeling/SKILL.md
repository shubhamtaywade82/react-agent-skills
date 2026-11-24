---
name: typescript-async-error-modeling
description: Model asynchronous success, failure, cancellation, and retry states without ambiguous flag combinations.
license: MIT
---

# TypeScript Async Error Modeling

## Activate when

Use when async workflows, promise-heavy UI logic, retries, cancellation, timeouts, or error normalization are being changed.

## Repository inspection

Inspect TypeScript version, strictness, existing Result/error conventions, async helpers, API clients, test utilities, and whether cancellation uses AbortSignal. Identify whether errors cross a public module boundary — crossing changes the model from convenience to contract.

## Decision framework

Prefer discriminated unions when states have different legal data. Separate expected operational failures from programmer faults. Make cancellation distinct when callers need different behavior. Keep retry policy outside low-level types unless the type itself represents retryable state.

The three-failure taxonomy — model each distinctly, never as one `error` field:

| Class | Examples | Handling model |
|---|---|---|
| Operational (expected) | 404, validation rejection, payment declined | `{ kind: "failure", reason: ... }` — typed, user-visible |
| Programmatic fault (bug) | TypeError, invariant violation, undefined access | Let it THROW — crash in dev, error-boundary in prod, never "handle" |
| Cancellation (not an error) | superseded request, unmount, caller timeout | `{ kind: "cancelled" }` — invisible or ignored by design |

Result shape selection:

```
hot path, two outcomes        Result<T> = { ok: true; value: T } | { ok: false; error: E }
states carry different data   discriminated union on a "phase"/"kind" field
promise already throws deep   async function + typed error class at the boundary
cancellation matters          explicit { kind: "cancelled" } member — NOT an Error subclass
```

## Implementation

- Give async state one authoritative source of truth.
- Model loading, success, failure, and cancellation transitions explicitly when concurrent operations exist.
- Normalize unknown thrown values at boundaries.
- Preserve error causes where the runtime supports them.
- Make stale-result prevention and request identity explicit.
- Avoid boolean combinations that permit contradictory states.

**Reference example** — the full model with race-safe state, cancellation, and cause preservation:

```ts
// The async state machine — no flag combinations, cancellation first-class
export type AsyncState<T> =
  | { phase: "loading"; requestId: number }
  | { phase: "success"; value: T; requestId: number }
  | { phase: "failure"; error: DomainError; requestId: number; retryable: boolean }
  | { phase: "cancelled"; requestId: number };      // NOT an error: caller superseded it

// Normalization at the untrusted boundary: unknown → DomainError, causes preserved
export function toDomainError(raw: unknown): DomainError {
  if (raw instanceof HttpError) {
    const status = raw.status;
    return {
      kind: "operational",
      code: raw.code,
      message: userMessage(raw),
      retryable: status >= 500 || status === 429,
      cause: raw.cause,                             // chain preserved for logs
    };
  }
  if (raw instanceof DOMException && raw.name === "AbortError") {
    return { kind: "cancelled" as const, code: "aborted", message: "", retryable: false };
  }
  // Programmatic faults (TypeError, etc.) rethrow: never model bugs as user errors
  if (raw instanceof TypeError) throw raw;
  return { kind: "operational", code: "unknown", message: "Something went wrong",
           retryable: false, cause: raw };
}

// Race-safe transition: request identity prevents stale writes
export function transition<T>(current: AsyncState<T>, next: AsyncState<T>): AsyncState<T> {
  if (next.requestId < (current as { requestId: number }).requestId) {
    return current;                                  // stale response loses — by construction
  }
  return next;
}

// Consumer narrowing is exhaustive: every phase is handled or explicitly ignored
function render(state: AsyncState<Order[]>): ReactNode {
  switch (state.phase) {
    case "loading":  return <Skeleton />;
    case "success":  return <Orders items={state.value} />;
    case "failure":  return state.retryable ? <Retry onRetry={refetch} /> : <TerminalError />;
    case "cancelled": return null;                  // deliberately silent — not a user error
  }
}
```

```ts
// Retry policy stays OUT of the low-level type: the policy wraps, the state reports
async function fetchWithRetry<T>(fn: (signal: AbortSignal) => Promise<T>, policy: Policy): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try { return await fn(policy.signal); }
    catch (error) {
      if (policy.signal.aborted || attempt >= policy.maxAttempts) throw error;
      if (!isRetryable(error)) throw error;         // policy decides; type doesn't know
      await backoff(attempt, policy.signal);
    }
  }
}
```

## Failure modes

- Swallowed exceptions — a `catch {}` that turns bugs into "it didn't work" with zero telemetry.
- `any`-typed error values flowing into UI (`error: any` → `error.message` crashing on undefined).
- Stale responses overwriting newer state (missing request identity/ordering in the model).
- Retries duplicating side effects — non-idempotent POST retried because "the type says retryable".
- Cancellation displayed as a user error (AbortError rendering "Something went wrong" over fresh content).
- `isLoading && isFailed`-style flag combinations — contradictory states representable and eventually rendered.
- Modeling programmatic faults as operational failures — a TypeError shown as a retryable user message; the bug never surfaces.
- `Promise.reject` with non-Error values (strings/objects) breaking `instanceof` chains downstream.

## Review

Check transition completeness (every phase reachable, stale inputs discarded), exhaustive narrowing (switch or `satisfies` on every consumer), error provenance (cause chain preserved for logs; user message separated from log detail), race handling (request identity in the type, not the discipline), retry safety (policy outside the type; idempotency caller-gated), and whether the chosen types match the actual runtime contract (does the API client actually reject with HttpError?).

## Verification

Add deterministic tests for success, operational failure, cancellation, retry, and stale-response cases. Concretely: (a) race test — late stale resolution leaves newer state intact; (b) cancellation test — abort mid-flight yields the `cancelled` member and renders nothing; (c) normalization test — `toDomainError(new TypeError(...))` THROWS (faults rethrow), 5xx yields retryable, 422 yields non-retryable; (d) exhaustive consumer check — removing one case from the switch is a compile error (enable `noImplicitReturns` or use a `satisfies never` default). Run repository typecheck, lint, tests, and build as applicable.
