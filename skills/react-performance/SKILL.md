---
name: react-performance
description: Use for render performance, memoization, large lists, code splitting, profiling, and frontend performance budgets.
license: MIT
---

# React Performance

## Purpose

Optimize measured bottlenecks without turning normal React code into an identity-management maze. The performance discipline is: measure, fix ownership and unnecessary work first, memoize last and locally, and re-measure.

## Activate when

- investigating slow renders;
- introducing memoization or virtualization;
- changing bundle loading;
- handling high-volume UI.

## Boundary with related skills

- Use `react-performance` for render cost, memoization, virtualization, and code-splitting decisions.
- Use `react-compiler` when the repository uses React Compiler and the question is manual vs compiler memoization.
- Use `react-server-components` for server/client split performance (payload, waterfall elimination).
- Use `react-state-management` when the root cause is state ownership, not render cost.

## Repository inspection

Inspect profiler evidence, render frequency, state ownership, object identity, list sizes, bundle reports, loading waterfalls, and existing performance budgets. Establish where time actually goes (scripting vs rendering vs network) before touching components.

## Decision rules

- Measure before optimizing.
- Fix state ownership and unnecessary work before memoization: state lifted too high re-renders whole subtrees — no amount of memo repairs that.
- Use useMemo/useCallback only for a demonstrated recalculation or identity problem.
- Virtualize only when workload characteristics justify it (thousands of rows, fixed measurement) and semantics remain correct.
- Prefer meaningful code-splitting boundaries (routes, heavy modals, per-feature charts) over fragmenting everything.

The ladder, cheapest first:

```
1. state placement     — move state down to the component that needs it
2. composition         — pass elements as children to cut re-render scope
3. avoidable work      — early returns, lazy init, event-driven updates
4. memo()              — only when profiling shows the subtree re-render is hot
5. virtualization      — only for measured large-list cost
```

## Implementation procedure

1. Establish a baseline (profiler trace, interaction timing, bundle size).
2. Identify the hot path from the trace, not intuition.
3. Remove unnecessary work (ladder steps 1–3).
4. Apply the smallest targeted optimization.
5. Re-measure against the baseline.
6. Add a regression benchmark when the constraint matters.

**Reference example** — the same fix at three ladder levels, applied smallest-first:

```tsx
// PROBLEM (profiler: entire page re-renders on each keystroke)
function SettingsPage() {
  const [search, setSearch] = useState("");             // state owned by the page
  return (
    <>
      <HeavyReportTable />                              // re-renders per keystroke
      <FilterInput value={search} onChange={setSearch} />
    </>
  );
}

// FIX level 1 — state placement: no memo needed, no API change
function SettingsPage() {
  return (
    <>
      <HeavyReportTable />
      <FilterableSection />                             // search state moved down
    </>
  );
}
function FilterableSection() {
  const [search, setSearch] = useState("");
  return <FilterInput value={search} onChange={setSearch} />;
}

// If a genuinely hot subtree still re-renders through unavoidable props:
// FIX level 4 — targeted memo with a custom comparison only where measured
const HeavyReportTable = memo(function HeavyReportTable({ regionId }: { regionId: RegionId }) {
  return <table>{/* 400 cells computed once per regionId */}</table>;
}, (prev, next) => prev.regionId === next.regionId);
```

```tsx
// Level 5 — virtualization gate: only when the list is actually large
const ROWS_BEFORE_VIRTUALIZATION = 200; // repository-tunable threshold
function ResultList({ items }: { items: Item[] }) {
  if (items.length < ROWS_BEFORE_VIRTUALIZATION) return <PlainList items={items} />;
  return <VirtualizedList items={items} rowHeight={48} />;
}
```

## Anti-patterns / failure modes

- Blanket memoization (`memo()` on every exported component) — maintenance cost with unmeasured benefit, and it breaks legitimately in list-item callbacks unless paired correctly.
- Optimization based on intuition ("it felt slow") without a trace.
- Virtualization for small lists — complexity, a11y hazards, and lost browser find-in-page.
- Claiming performance gains without measurements — report the trace, not the vibe.
- useCallback wrapping every handler while the actual issue is context-value identity rebuilt per render.
- Code-splitting that fragments shared chunks into a waterfall of sequential requests.

## Agent review checklist

- [ ] What measurement motivated this change (trace numbers before/after)?
- [ ] What workload makes it worthwhile (data size, interaction frequency)?
- [ ] Did complexity increase more than the evidence justifies?
- [ ] Was the ladder respected — ownership/composition before memo?

## Verification

Profiler/devtools evidence, bundle analysis, targeted benchmarks, interaction tests, and standard CI checks. Report before/after numbers from the same workload; for bundle changes, attach the analyzer output (chunk sizes, initial payload) to the change.

## Source foundation

- React memo: https://react.dev/reference/react/memo
- React performance guidance: https://react.dev/learn (and the profiler usage guide at https://react.dev/blog/2018/09/10/introducing-the-react-profiler)

## Compiler-aware memoization

In compiler-enabled repositories, prefer React Compiler optimization for new code. Manual memo/useMemo/useCallback are explicit escape hatches for measured or semantically required referential stability; compose with `react-compiler` before adding or removing them.
