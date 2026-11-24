---
name: react-hooks-effects
description: Use when working with React hooks, effects, refs, memoization, subscriptions, or external synchronization.
license: MIT
---

# React Hooks and Effects

## Purpose

Hooks let function components hold state and synchronize with the world. The discipline is classification: render-time work derives; event handlers respond; effects synchronize with systems outside React (the network, the DOM, timers, subscriptions, other widgets). An effect that merely transforms data on the way to other state is an event or a derivation wearing a costume — it runs extra renders, closes over stale values, and breaks under Strict Mode's deliberate double-invoke.

## Activate when

- adding or repairing `useEffect` or custom hooks;
- diagnosing stale closures or dependency-array churn;
- writing subscriptions, timers, or cancellable async work;
- deciding on `useMemo`/`useCallback`/`useRef` usage.

## Boundary with related skills

- Use `react-state-management` for where state lives; this skill for lifecycle and synchronization.
- Use `react-data-fetching` for server-state patterns (caching, revalidation) built on effects.
- Use `react-async-ui` for the UI states async work drives (loading/empty/error).
- Use `react-performance` for render-cost work beyond measured memoization.

## Repository inspection

Inspect hook usage and dependency linting (`eslint-plugin-react-hooks` — is exhaustive-deps on?), external subscriptions (event emitters, websockets, observers), timers, async effects with and without cancellation, and duplicated derived state kept in sync by effects. Flag every `useEffect(() => { setX(f(props)); }, [props])` — that shape is a derivation.

## Decision rules

- Derive values during render when possible; `useMemo` only when the derivation is genuinely expensive or referential identity matters.
- Effects are for synchronization with external systems — name the system, or delete the effect.
- Every subscription/timer/async effect has explicit cleanup; async effects need cancellation (ignore-flag or `AbortController`) to survive dependency churn.
- The dependency array is the contract, not an obstacle: exhaustive-deps stays on; suppressing it requires a written invariant comment (`// eslint-disable-next-line react-hooks/exhaustive-deps — stable per mount`).
- `useRef` holds incidental mutable containers (DOM nodes, timer ids, latest-value mirrors) — never hidden application state that renders should observe.
- Memoization requires a measured or contract-driven reason (identity-sensitive child, expensive compute); blanket `useMemo`/`useCallback` is noise the next reader must audit.

## Implementation procedure

1. Classify the logic: render derivation, event response, state transition, or external synchronization.
2. Convert misclassified effects to render derivation or event handlers first — deletion is the best repair.
3. For real synchronization, define the external system, the subscription protocol, and the cleanup.
4. Handle cancellation and response races: later requests must supersede earlier ones.
5. Test setup, dependency change, cleanup, unmount, and the race (slow first request vs fast second).

**Reference example** — a subscription hook with correct lifecycle, and the race fix for async fetch-in-effect:

```tsx
// Custom hook: subscribes to ONE external system, cleans up unconditionally.
function useWindowSize(): { width: number; height: number } {
  const [size, setSize] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);  // unsubscribe IS the contract
  }, []);
  return size;
}

// Fetch-in-effect with cancellation: the classic race (slow A, fast B, A resolves last) is the bug.
function useUser(id: string): UserState {
  const [state, setState] = useState<UserState>({ kind: "loading" });
  useEffect(() => {
    const controller = new AbortController();
    setState({ kind: "loading" });
    fetch(`/api/users/${id}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => { if (!controller.signal.aborted) setState({ kind: "ready", user: data }); })
      .catch((e) => { if (!controller.signal.aborted) setState({ kind: "error", message: String(e) }); });
    return () => controller.abort();   // id change or unmount cancels the in-flight request
  }, [id]);
  return state;
}
```

Both examples pass the review questions: one external system each, cleanup unconditional, and the dependency change (`id`) cancels the stale work instead of racing it.

## Anti-patterns / failure modes

- Effects deriving state (`setFull(name.first + " " + name.last)` on `[name]`) — render it instead; duplicates and desyncs.
- Effect chains simulating workflows (`useEffect` A sets state triggering effect B) — the flow is untestable and reruns on every render pass.
- Missing cleanup: listeners, timers, sockets, observers pile up on every mount.
- Ignoring `exhaustive-deps` wholesale — stale closures that "work in dev" and break under Strict Mode double-invoke.
- Refs as hidden state the render reads — mutation without re-render, then a surprise re-render shows it.
- Blanket memoization of every value and callback — audit cost now, no measured benefit ever.
- setInterval inside an effect without clearInterval — timers survive unmount and leak.

## Agent review checklist

- Why must this be an effect — which external system does it synchronize?
- What happens when dependencies change rapidly (race, cancel, re-subscribe)?
- What happens on unmount (cleanup present and unconditional)?
- Is any effect actually a derivation in costume?
- Is every dependency suppression justified in a written invariant?

## Verification

Focused hook/component tests: setup and teardown on mount/unmount, dependency-change behavior, unmount-during-inflight cancellation, and the response race (assert the stale response is ignored). Run `eslint-plugin-react-hooks` with exhaustive-deps, typecheck, and lint.
