---
name: react-modern-rendering
description: Reason about concurrent rendering, Suspense, transitions, actions, hydration, streaming, and compiler-assisted optimization in modern React runtimes.
---

## Activate when
Use when changing Suspense boundaries, transitions, async rendering, hydration, streaming, server/client boundaries, actions, or React Compiler configuration.

## Repository inspection
Inspect React version, framework/runtime, compiler setup, Suspense usage, hydration boundaries, build transforms, and browser support.

## Decision framework
Treat rendering semantics as runtime behavior, not syntax. Preserve existing framework conventions for server/client execution. Use transitions for non-urgent UI work and Suspense only where the data/runtime contract supports it.

## Implementation
- Keep render functions pure and deterministic.
- Make hydration-sensitive output stable.
- Place Suspense boundaries around independently recoverable work.
- Keep urgent input updates separate from transition work.
- Verify compiler or memoization behavior rather than assuming either.

## Failure modes
Watch for hydration mismatch, hidden waterfalls, suspended critical content, stale transition updates, client/server module confusion, and accidental dependency on implementation-specific memoization.

## Review
Check render ownership, server/client boundaries, fallback UX, hydration correctness, and framework/runtime compatibility.

## Verification
Run SSR and hydration or framework-specific tests where applicable, plus typecheck, component tests, and production build.

## React 19 integration

When React 19.x is confirmed, compose with `react-19-modern-apis` for version-specific Activity, ViewTransition, Fragment Refs, browser(), cacheSignal and resource API guidance.
