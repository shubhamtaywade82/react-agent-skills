---
name: react-data-fetching
description: Use when implementing HTTP APIs, HTTP request lifecycles, generic data fetching, server state, caching, invalidation, optimistic updates, and asynchronous query behavior.
license: MIT
---

# React Data Fetching

## Purpose

Treat server state as a lifecycle: loading, success, empty, stale, error, cancellation, and mutation states. Server state is not client state — it has an owner on the other side of the network, a freshness contract, and a coordination problem (who refetches, when, after what). The data layer answers those; components only render the lifecycle.

## Activate when

- consuming an API;
- adding query/mutation behavior;
- fixing cache invalidation or stale-response bugs.

## Boundary with related skills

- Use `react-data-fetching` for the server-state model: keys, caching, invalidation, mutation consistency.
- Use `tanstack-query` / `swr` when the repository uses a specific query library — its mechanics replace hand-rolled caching.
- Use `frontend-networking` for the transport layer under the data layer (timeout, retry, abort, error classification).
- Use `react-async-ui` for rendering the lifecycle states.
- Use `react-node-integration` / `react-rails-integration` when the backend's contract semantics (pagination, error envelope) are in play.

## Repository inspection

Inspect API clients, query/cache library, fetch conventions, auth/session handling, retry rules, cache keys, cancellation, and runtime validation. Prefer the repository's existing query library and conventions over introducing a parallel hand-rolled cache.

## Decision rules

- Keep HTTP mechanics out of presentational components when a data boundary exists.
- Cache keys must contain every resource identity dimension: resource + params + filters + current identity scope. A missing dimension is a cross-user/cross-filter data leak.
- Cancel or ignore superseded requests where ordering can race.
- Retries must respect operation idempotency.
- Validate external responses before domain use (`unknown` in, schema-validated out).
- Optimistic updates require rollback or reconciliation (server error, or server returns the authoritative value that disagrees).

Invalidation rule: after a mutation changes resource R, every cached query whose key includes R is stale. Invalidation lists should be derived from the mutation's contract (which resources it touches), not guessed per screen.

## Implementation procedure

1. Define request/response contract.
2. Validate runtime data at the boundary.
3. Define cache identity/freshness.
4. Model loading/empty/error/success.
5. Define mutation consistency and recovery.
6. Test cancellation and invalidation.

**Reference example** — a query with complete cache identity, schema validation, and mutation-driven invalidation (framework-agnostic shape; React Query shown):

```ts
// 1. contract: schema-validated at the boundary
const OrderSchema = z.object({
  id: z.string(),
  status: z.enum(["open", "paid", "shipped"]),
  items: z.array(z.object({ sku: z.string(), qty: z.number().int().positive() })),
});

// 2. cache identity: every dimension in the key
const ordersQuery = (opts: OrderFilters, userId: string) =>
  queryOptions({
    queryKey: ["orders", userId, opts] as const,   // scope + filters: complete identity
    queryFn: async ({ signal }) => {
      const payload = await apiFetch(`/orders?${qs(opts)}`, {
        signal,                                       // cancellation wired
        schema: z.array(OrderSchema),                 // unknown in, validated out
      });
      return payload;
    },
    staleTime: 30_000,
  });

// 3. mutation + derived invalidation with rollback
function usePayOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) =>
      apiFetch(`/orders/${orderId}/pay`, { method: "POST", retries: 0 }), // non-idempotent
    onMutate: async (orderId) => {
      await queryClient.cancelQueries({ queryKey: ["orders"] }); // supersede in-flight reads
      const previous = queryClient.getQueriesData({ queryKey: ["orders"] });
      queryClient.setQueriesData({ queryKey: ["orders"] }, (orders: Order[]) =>
        orders.map((o) => (o.id === orderId ? { ...o, status: "paid" } : o))); // optimistic
      return { previous };
    },
    onError: (_error, _orderId, context) => context?.previous.forEach(([key, data]) =>
      queryClient.setQueryData(key, data)),                       // rollback
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["orders"] }), // authoritative refetch
  });
}
```

## Anti-patterns / failure modes

- Fetch duplicated across components — one screen, four requests, no cache; extract the query, not a new abstraction.
- Stale responses overwriting newer state (missing signal/abort on refetch by key).
- Incomplete cache keys — `["orders"]` missing the user scope or filter object → wrong user's data rendered.
- Optimistic updates without recovery — error path leaves the fake "paid" status on screen.
- Storing fetched server state in `useState`/Redux and duplicating freshness logic the query library already owns.
- `refetchOnWindowFocus` fighting an optimistic update (refetch storm during mutation).
- Mutating cached data directly without notifying the cache (desynced subscribers).

## Agent review checklist

- [ ] Is server state separate from UI state (no server data in `useState` where a query cache owns it)?
- [ ] What makes two responses equivalent — does the key capture scope + every filter?
- [ ] What happens after navigation and back — cache hit with correct freshness?
- [ ] How is cache consistency restored after mutation success/failure (rollback + invalidate)?
- [ ] Are superseded requests cancelled or ignored by ordering?

## Verification

Test initial load, empty, error, cancellation, refetch, cache hit, invalidation, and mutation failure/success. Include: (a) a race — response resolves after key change — asserting no stale write; (b) an invalidation test — mutation settles → cache refetches; (c) an optimistic rollback — server 500 → previous data restored. Run with the repository's query-library test utilities (e.g. `QueryClient` in test mode with deterministic timers).
