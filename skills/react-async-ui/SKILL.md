---
name: react-async-ui
description: Design explicit async UI states including initial load, refresh, mutation, empty, error, retry, cancellation, and stale-data behavior.
license: MIT
---

# React Async UI

## Purpose

Make every asynchronous state the user can observe explicit and intentional: initial load, background refresh, mutation in flight, empty, error, retry, cancellation, and stale data. Most async UI bugs are state-machine bugs — one boolean `isLoading` standing in for five distinct states that need different rendering.

## Activate when

Use when a component consumes async data, submits mutations, refreshes content, or changes behavior based on loading and error state.

## Boundary with related skills

- Use `react-async-ui` for the rendering and state-machine side of async behavior.
- Use `react-data-fetching` / `tanstack-query` for the data layer itself (queries, cache, invalidation) — this skill owns what the user sees.
- Use `react-error-resilience` for boundary-level failure containment (error boundaries, fallback trees).
- Use `frontend-debugging` when diagnosing an existing race or flicker.

## Repository inspection

Inspect data-fetching library (React Query/SWR/Apollo or a custom hook), query and mutation conventions, existing state model, error boundaries, retry policy, skeleton/loading patterns, and test helpers. Mirror the repository's loading/empty/error conventions before introducing new ones.

## Decision framework

Separate initial load from background refresh and mutation state when the user experience differs. Do not collapse empty, error, loading, and stale-success states into one boolean.

Model the full state matrix before rendering:

| State | Render | User can act? |
|---|---|---|
| initial-loading | skeleton | no (or cancel) |
| fresh-success | content | yes |
| stale-success (background refresh) | content + subtle indicator | yes |
| empty | empty-state affordance | create/filter |
| retryable-error | error + retry action | retry |
| terminal-error | error + recovery path | navigate/support |
| mutating | content + pending on the action | disabled only if unsafe |

- Derive booleans from the matrix (`isInitialLoad`, `isRefreshing`, `isMutating`), never the reverse.
- Disable or deduplicate actions only when concurrent mutations are unsafe (non-idempotent POST); allow parallel safe reads.
- Preserve stale data during background refresh when safe; replace it only on success.
- Surface retryable versus terminal failures differently (401/403/410 terminal; network/5xx/429 retryable with backoff).

## Implementation

- Make visible state transitions explicit.
- Preserve usable stale data during background refresh when safe.
- Disable or deduplicate actions only when concurrent mutations are unsafe.
- Surface retryable versus terminal failures appropriately.
- Handle cancellation and stale responses without corrupting visible state.

**Reference example** — an explicit async state machine for a paginated list with refresh, stale data, and retryable errors:

```tsx
type ListState =
  | { phase: "initial" }
  | { phase: "error"; retryable: boolean; message: string }
  | { phase: "ready"; items: Item[]; refreshing: boolean; stale: boolean };

function ItemList({ query }: { query: string }) {
  const [state, setState] = useState<ListState>({ phase: "initial" });
  const [page, setPage] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => (s.phase === "ready" ? { ...s, refreshing: true } : { phase: "initial" }));

    fetchItems({ query, page, signal: controller.signal })
      .then((result) => setState({ phase: "ready", items: result.items, refreshing: false, stale: result.stale }))
      .catch((error) => {
        if (controller.signal.aborted) return; // stale response — leave visible state alone
        const status = error instanceof HttpError ? error.status : 0;
        setState({
          phase: "error",
          retryable: status === 0 || status >= 500 || status === 429,
          message: userMessage(error),
        });
      });

    return () => controller.abort(); // new query/inputs or unmount cancels the old request
  }, [query, page]);

  if (state.phase === "initial") return <ListSkeleton aria-busy="true" />;
  if (state.phase === "error") {
    return (
      <ErrorState message={state.message}>
        {state.retryable && <Button onClick={() => setPage((p) => p)}>Retry</Button>}
        <Link href="/support">Contact support</Link>
      </ErrorState>
    );
  }
  return (
    <section aria-live="polite">
      {state.stale && <p className="notice">Showing cached results…</p>}
      {state.items.length === 0 ? (
        <EmptyState onCreate={() => navigate("/items/new")} />
      ) : (
        <List items={state.items} />
      )}
      <RefreshButton pending={state.refreshing} onRefresh={() => setPage((p) => p)} />
    </section>
  );
}
```

## Failure modes

- Loading flicker: initial-load skeleton flashing on every background refresh — keep `initial` and `refreshing` distinct.
- Error replacement of valid stale data: a failed refresh wiping the visible list — only a successful response replaces content.
- Duplicate submissions: no pending state on the submit action for non-idempotent mutations.
- Retry loops: automatic retry without a cap or backoff on a failing endpoint.
- Success UI racing a newer request: an un-aborted stale response overwriting the state of a newer query (stale-closure or missing `AbortController`).
- Empty state unreachable: `items.length === 0` check after a single `loading` guard hides the affordance to create the first item.
- Status changes invisible to assistive tech: missing `aria-live` regions for async status announcements.

## Agent review checklist

- [ ] All seven matrix states reachable and rendered deliberately.
- [ ] Initial load and background refresh are distinct states.
- [ ] Failed refresh preserves stale content; only success replaces it.
- [ ] In-flight requests aborted on input change and unmount.
- [ ] Retry distinguished from terminal failure; retry has backoff or user control.
- [ ] Async status announced accessibly (`aria-live`, `aria-busy`).

## Verification

Test initial loading, success, empty, refresh, mutation, failure, retry, and stale-response cases with realistic user interactions. Include at least one race test (response resolves after input change) asserting the visible state is not corrupted. Run the repository's typecheck and focused component tests; verify the state matrix renders with React Testing Library or the repository's harness.

## Source foundation

State separation and stale-data preservation follow the data-fetching guidance in the React docs (https://react.dev/learn/synchronizing-with-effects, https://react.dev/reference/react/useEffect) and React Query's stale-while-revalidate semantics (https://tanstack.com/query/latest). Accessibility of async status uses WAI-ARIA live regions (https://www.w3.org/WAI/WCAG22/Understanding/status-messages). Repository conventions should still be inspected before implementation.
