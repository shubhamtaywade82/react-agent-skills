---
name: react-performance
description: Use for render performance, memoization, large lists, code splitting, profiling, and frontend performance budgets.
---

# React Performance

## Purpose
Optimize measured bottlenecks without turning normal React code into an identity-management maze.

## Activate when
- investigating slow renders;
- introducing memoization or virtualization;
- changing bundle loading;
- handling high-volume UI.

## Repository inspection
Inspect profiler evidence, render frequency, state ownership, object identity, list sizes, bundle reports, loading waterfalls, and existing performance budgets.

## Decision rules
- Measure before optimizing.
- Fix state ownership and unnecessary work before memoization.
- Use useMemo/useCallback only for a demonstrated recalculation or identity problem.
- Virtualize only when workload characteristics justify it and semantics remain correct.
- Prefer meaningful code-splitting boundaries.

## Implementation procedure
1. Establish a baseline.
2. Identify the hot path.
3. Remove unnecessary work.
4. Apply the smallest targeted optimization.
5. Re-measure.
6. Add a regression benchmark when the constraint matters.

## Anti-patterns / failure modes
- blanket memoization;
- optimization based on intuition;
- virtualization for small lists;
- claiming performance gains without measurements.

## Agent review checklist
- What measurement motivated this change?
- What workload makes it worthwhile?
- Did complexity increase more than the evidence justifies?

## Verification
Profiler/devtools evidence, bundle analysis, targeted benchmarks, interaction tests, and standard CI checks.

## Source foundation
- React memo: https://react.dev/reference/react/memo
- React performance guidance: https://react.dev/learn
