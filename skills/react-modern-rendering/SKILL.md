---
name: react-modern-rendering
description: Reason about concurrent rendering, Suspense, transitions, actions, hydration, streaming, and compiler-assisted optimization in modern React runtimes.
license: MIT
---

# React Modern Rendering

## Purpose

Reason about concurrent rendering semantics deliberately: Suspense boundaries as recovery scopes, transitions as priority lanes, hydration as a contract between two renders, and the compiler as an optimizer with observable behavior. Modern React gives you controls over *when* and *where* rendering happens; most bugs come from treating those controls as syntax instead of runtime contracts.

## Activate when

Use when changing Suspense boundaries, transitions, async rendering, hydration, streaming, server/client boundaries, actions, or React Compiler configuration.

## Boundary with related skills

- Use `react-modern-rendering` for concurrent semantics (Suspense, transitions, hydration, streaming).
- Use `react-server-components` for the component architecture across the server/client boundary.
- Use `react-compiler` for compiler-specific setup and escape hatches.
- Use `react-19-modern-apis` for React 19-specific APIs (Activity, ViewTransition, `browser()`, cacheSignal).

## Repository inspection

Inspect React version, framework/runtime, compiler setup, Suspense usage, hydration boundaries, build transforms, and browser support. Note the rendering pipeline: which framework (Next.js/Remix/TanStack Start or CRA/Vite SPA) determines what hydration/streaming behavior actually applies.

## Decision framework

Treat rendering semantics as runtime behavior, not syntax. Preserve existing framework conventions for server/client execution. Use transitions for non-urgent UI work and Suspense only where the data/runtime contract supports it.

Urgency lanes:

| Update | Mechanism | User perception |
|---|---|---|
| Typing, dragging, toggles | Urgent (default `setState`) | Must land same frame |
| Search results, list refetch | `startTransition` | Deliberate wait OK, spinner optional |
| Route/panel prefetch | `useDeferredValue` / background | Stale shown while fresh prepares |
| Initial data of a region | Suspense + lazy data | Region recovers independently |

- A transition tells React the previous screen stays usable until the new one is ready — it is not a loading indicator.
- Suspense boundary placement = failure/recovery granularity: too high (whole page suspended on one query), too low (spinner noise). Boundaries go around regions that recover independently.
- Hydration is a second render that must produce the same output as the first (server) — any nondeterminism (Date.now, Math.random, locale time) in render output is a mismatch waiting for production.

## Implementation

- Keep render functions pure and deterministic.
- Make hydration-sensitive output stable.
- Place Suspense boundaries around independently recoverable work.
- Keep urgent input updates separate from transition work.
- Verify compiler or memoization behavior rather than assuming either.

**Reference example** — correct lane separation and boundary placement:

```tsx
function SearchPage() {
  const [query, setQuery] = useState("");          // urgent: input stays responsive
  const deferredQuery = useDeferredValue(query);   // background: results catch up
  const isStale = query !== deferredQuery;

  return (
    <main>
      <SearchInput value={query} onChange={setQuery} />
      {/* Boundary around the RESULTS region only — header/input never suspend */}
      <Suspense fallback={<ResultsSkeleton />}>
        <ErrorBoundary fallback={<ResultsError />}>
          <Results query={deferredQuery} isStale={isStale} />
        </ErrorBoundary>
      </Suspense>
    </main>
  );
}

function Results({ query, isStale }: ResultsProps) {
  // Resource-based data: suspends this subtree, recovers at THIS boundary
  const results = useSearchResults(query);
  return <ol className={isStale ? "results stale" : "results"}>{/* ... */}</ol>;
}

// Route-level non-urgent navigation
function ProductLink({ product }: { product: Product }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button onClick={() => startTransition(() => selectProduct(product))}>
      {isPending ? "Opening…" : product.name}
    </button>
  );
}
```

Hydration-safe pattern for environment-dependent output:

```tsx
// WRONG in render output: Date.now() differs server vs client hydration pass
<span>Joined {new Date().getFullYear()}</span>  // mismatch if year rolls between renders

// RIGHT: deterministic at both renders; corrects after mount if needed
function Joined({ isoDate }: { isoDate: string }) {
  const [now, setNow] = useState(INITIAL_YEAR_CONST);   // stable first paint
  useEffect(() => setNow(new Date().getFullYear()), []); // correct after hydration
  return <span>Joined {now}</span>;
}
```

## Failure modes

- Hydration mismatch from nondeterministic render output (dates, random ids, locale formatting) — the classic production-only crash.
- Hidden waterfalls: nested Suspense boundaries awaiting sequentially when the data could start in parallel; or transition wrapping the data fetch AFTER the render instead of with it.
- Suspended critical content: a boundary above the main content suspends the shell on one slow query.
- Stale transition updates: a slow transition completing after newer urgent input and clobbering it — check input currency in the transition result.
- Client/server module confusion: browser-only code imported where the server executes it (crash) or vice versa (silent capability loss).
- Accidental dependency on implementation-specific memoization — code that only works when `memo` happens to bail out; breaks when compiler behavior changes.
- Using `startTransition` around typing input — the input itself must stay urgent.

## Review

Check render ownership (who computes what, pure and deterministic), server/client boundaries, fallback UX (each region has a deliberate skeleton, not a page-wide spinner), hydration correctness (no nondeterministic output), and framework/runtime compatibility.

## Verification

Run SSR and hydration or framework-specific tests where applicable, plus typecheck, component tests, and production build. Specifically: (a) hydration test with a server-rendered snapshot (no mismatch warnings in a clean console); (b) interaction test proving urgent input stays responsive while a transition is pending (fire input events, assert value applied synchronously); (c) error-boundary test proving a failed region recovers without unmounting the shell.

## React 19 integration

When React 19.x is confirmed, compose with `react-19-modern-apis` for version-specific Activity, ViewTransition, Fragment Refs, browser(), cacheSignal and resource API guidance.
