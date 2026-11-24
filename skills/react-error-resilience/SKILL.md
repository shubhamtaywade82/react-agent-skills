---
name: react-error-resilience
description: Use for React error boundaries, loading/empty/error states, retries, cancellation, graceful degradation, and recovery UX.
license: MIT
---

# React Error Resilience

## Purpose

Make failure states explicit, classified, and recoverable. A resilient UI distinguishes what went wrong (loading vs empty vs unauthorized vs unavailable vs unexpected), decides deliberately whether recovery is possible (retry semantics belong to the operation, not the user's frustration), and preserves the user's context and input through recovery. Error boundaries are render-tree insurance — they are not API error handling, and conflating the two is how "something went wrong" screens swallow actionable failures.

## Activate when

- adding data-dependent UI (loading/empty/error states per data source);
- introducing or reviewing error boundaries;
- designing retry, cancellation, or recovery behavior;
- handling API failures with distinct semantics (401/403/404/409/5xx).

## Boundary with related skills

- Use `react-async-ui` for the async UI state machine shapes (suspense, skeletons) these states feed.
- Use `typescript-api-contracts` for the error envelope (retryable/terminal/permission) that drives classification.
- Use `auth-session-boundaries` for the 401 → refresh → re-authentication flow this skill must not duplicate.
- Use `react-error-resilience`'s sibling `react-error-boundaries`-style patterns only via this file's boundary-scoping rules — boundaries here, requests in the data layer.

## Repository inspection

Inspect existing error boundaries (placement, fallbacks, reset keys), route-level error routes, API error normalization (does a typed envelope exist?), retry policy (where, bounded?, idempotency-aware?), loading/empty state conventions, cancellation discipline, and how unexpected failures are instrumented.

## Decision rules

- Enumerate the failure taxonomy per data source: loading, empty, rejected-permission (401/403), rejected-terminal (404/409/422), unavailable (retryable 5xx/timeout), unexpected.
- Error boundaries handle render-tree failures (a component threw); request failures are handled at the request layer with their own UI — never both at once.
- Retry only when the operation is idempotent or safe-to-repeat, the failure is in the retryable class, and the attempt count is bounded with backoff — user actions (submit, pay) are never auto-retried.
- Cancellation is part of resilience: superseded requests are aborted (or ignored) so stale responses don't overwrite fresh state.
- Preserve user work across recovery: form input, drafts, and navigation context survive refresh/re-auth/reset; a "reset" that silently discards user work is data loss.
- Instrument unexpected failures (not expected 404s) with the action and state needed to reproduce.

## Implementation procedure

1. Enumerate the failure states for each data source; assign each an owner (component, boundary, route, or global).
2. Map each state to the error envelope class; write the recovery action (retry, re-auth, contact, go-back) next to it.
3. Place boundaries at structural seams (route segments, risky islands) with fallbacks that preserve navigation chrome.
4. Implement bounded, idempotency-aware retry with backoff and visible state (attempt n of m).
5. Instrument unexpected failures; leave expected ones (404, validation) to their UI states.
6. Failure-inject: force each state in tests, including mid-recovery and unmount paths.

**Reference example** — a boundary at a route seam, and classified request handling:

```tsx
// Boundary: render-tree insurance at a route seam; fallback keeps navigation chrome alive.
class SectionBoundary extends Component<
  { children: ReactNode; label: string },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    reportUnexpected(`section:${this.props.label}`, error, info.componentStack);  // unexpected only
  }
  render() {
    return this.state.error
      ? <Notice tone="error" title="This section failed to render">
          <button onClick={() => this.setState({ error: null })}>Try again</button>
        </Notice>                                     // navigation chrome above this stays intact
      : this.props.children;
  }
}

// Request layer: classification drives UI — never a generic "something went wrong".
function useOrder(id: string): OrderRequestState {
  const [state, setState] = useState<OrderRequestState>({ kind: "loading" });
  const attempt = useRef(0);
  const load = useCallback(async (signal: AbortSignal) => {
    setState({ kind: "loading" });
    try {
      const res = await fetch(`/api/orders/${id}`, { signal });
      if (res.status === 401 || res.status === 403) return setState({ kind: "forbidden" });   // re-auth/permission UI
      if (res.status === 404) return setState({ kind: "notFound" });                          // terminal: no retry
      if (!res.ok) throw new Error(`status ${res.status}`);                                   // retryable class
      setState({ kind: "ready", order: parseOrder(await res.json()) });
    } catch (e) {
      if (signal.aborted) return;                                   // superseded, not failed
      if (attempt.current < 3) {                                    // bounded retry, idempotent GET only
        attempt.current += 1;
        setTimeout(() => load(signal), 2 ** attempt.current * 250); // backoff 500ms, 1s, 2s
        setState({ kind: "retrying", attempt: attempt.current });
        return;
      }
      setState({ kind: "unavailable" });                            // 5xx/timeout after budget
    }
  }, [id]);
  useEffect(() => { const c = new AbortController(); load(c.signal); return () => c.abort(); }, [load]);
  return state;
}
```

The boundary catches render throws at a seam; the request layer classifies 401/403/404 separately from retryable 5xx, bounds retries with backoff on an idempotent GET, and treats superseded requests as neither failure nor success.

## Anti-patterns / failure modes

- One generic "Something went wrong" for every failure — permission answers, not-found, and outages all need different actions.
- Error boundaries as API error handling — the fetch failure never throws during render, so the boundary never fires and the data layer silently dies.
- Infinite or unbounded retries — the outage UI becomes the outage amplifier.
- Auto-retrying non-idempotent mutations (double payment, double submit).
- Stale responses overwriting fresh state because superseded requests weren't cancelled.
- Reset behavior that discards user work — "try again" that clears a half-written form is data loss.
- Instrumenting every expected 404 as an error — alert fatigue buries the real unexpected failures.

## Agent review checklist

- What failures are expected for this data source, and which state owns each?
- Is retry bounded, backoff'd, and restricted to idempotent operations?
- Do boundaries handle render failures only, at structural seams?
- What user context survives recovery (input, drafts, returnTo)?
- Are unexpected failures instrumented with reproduction context?

## Verification

Failure-injection tests: force each taxonomic state and assert its UI; boundary tests (throw in a child → fallback renders, siblings and navigation survive, reset recovers); retry tests (bounded attempts, backoff schedule, exhausted-budget state); superseded-request tests (slow-first/fast-second resolves to the fast result); unmount-during-retry paths assert no state updates after cancel.
