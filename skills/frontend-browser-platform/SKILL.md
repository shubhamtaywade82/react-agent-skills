---
name: frontend-browser-platform
description: Engineer against browser APIs, event lifecycles, storage, URL state, workers, visibility, focus, and platform capabilities.
license: MIT
---

# Frontend Browser Platform

## Purpose

Engineer against the browser platform deliberately: feature-detect what varies, clean up what subscribes, validate what is untrusted, and never assume `window` exists. Most browser-platform bugs are lifecycle bugs — a listener added twice, a worker never terminated, an object URL never revoked — or environment bugs — `window` touched during SSR, jsdom behavior mistaken for real-browser behavior.

## Activate when

Use when browser APIs, DOM events, storage, page lifecycle, clipboard, notifications, workers, media, or URL/history behavior are involved.

## Boundary with related skills

- Use `frontend-browser-platform` for platform capabilities and their lifecycles.
- Use `frontend-realtime` for WebSocket/SSE protocol behavior on top of the platform.
- Use `react-hooks-effects` for the React-specific synchronization of external systems.
- Use `frontend-debugging` when diagnosing browser-specific failures.

## Repository inspection

Inspect supported browsers (browserslist/CI matrix), polyfills, SSR constraints, browser utility modules, event listeners, storage wrappers, permissions, and test environment limitations. Note where existing utilities already wrap storage or events — extend them rather than adding parallel wrappers.

## Decision framework

Prefer stable platform primitives before dependencies. Define availability and fallback behavior for APIs that are optional, permissioned, or browser-specific.

The capability ladder for any platform API:

```
1. baseline everywhere      → use directly
2. optional capability      → feature-detect at runtime, degrade deliberately
3. permissioned             → request lazily at user action, handle denial
4. context-gated            → secure context / HTTPS only — plan the insecure fallback
5. environment-gated        → absent in SSR, tests, workers — guard entry points
```

## Implementation

- Feature-detect browser capabilities where necessary.
- Clean up listeners, observers, workers, timers, and object URLs.
- Treat localStorage, URLs, DOM content, and browser messages as untrusted inputs.
- Avoid assuming window or document exist during SSR/build phases.
- Preserve focus, history, and navigation semantics intentionally.

**Reference example** — a guarded platform module with detection, lifecycle cleanup, and untrusted-input validation:

```ts
// platform/clipboard.ts — optional + permissioned capability, guarded entry
export async function copyText(text: string): Promise<CopyResult> {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return { ok: false, reason: "unsupported" };            // feature detection first
  }
  if (!window.isSecureContext) {
    return { ok: false, reason: "insecure-context" };       // clipboard API needs HTTPS
  }
  try {
    await navigator.clipboard.writeText(text);
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: permissionDenied(error) ? "denied" : "error" };
  }
}

// platform/storage.ts — untrusted input, versioned envelope, SSR guard
export function readSetting<T>(key: string, schema: ZodSchema<T>): T | null {
  if (typeof window === "undefined") return null;            // SSR guard
  try {
    const raw = window.localStorage.getItem(key);            // storage is untrusted
    if (!raw) return null;
    const envelope = JSON.parse(raw) as unknown;             // unknown, never cast
    const parsed = EnvelopeSchema(schema).safeParse(envelope);
    return parsed.success ? parsed.data.value : null;        // corrupt → default, not crash
  } catch {
    return null;                                             // quota/private-mode/parse errors
  }
}

// platform/visibility.ts — lifecycle cleanup with stable subscriptions
export function onVisible(callback: () => void): () => void {
  const handler = () => document.visibilityState === "visible" && callback();
  document.addEventListener("visibilitychange", handler);
  return () => document.removeEventListener("visibilitychange", handler);  // caller MUST call
}

// React wiring: the effect owns the lifecycle — cleanup is symmetric
useEffect(() => onVisible(() => refreshStaleData(query)), [query]);
```

## Failure modes

- Memory leaks: listeners added on every render without cleanup; `URL.createObjectURL` never revoked; observers never `disconnect()`.
- Duplicate listeners from re-subscription bugs — the callback fires N times after N renders.
- SSR crashes: module top-level `window`/`document` access breaks the server build.
- Storage corruption taken down with the app: unparsed legacy/corrupt JSON crashing startup — validate the envelope instead.
- Permission races: requesting notification permission on load (denied forever) instead of at a user action.
- Behavior that differs between real browsers and jsdom-like environments (focus semantics, `IntersectionObserver`, clipboard) — jsdom passes, production fails, or vice versa.
- `localStorage` writes in private mode throwing uncaught.

## Review

Check lifecycle cleanup (every subscribe has an unsubscribe on all paths), capability detection (ladder rung chosen deliberately), security boundaries (storage/URL/message input validated), browser compatibility (matrix from browserslist, not memory), and test realism (does the test environment actually exercise the API or a stub of it).

## Verification

Run browser-level tests for meaningful DOM/platform behavior. Add focused unit tests for pure parsing and normalization code (the storage envelope parser is pure — test it without a browser). For lifecycle code, test the symmetric cleanup path: mount/unmount N times, assert subscriber count returns to baseline.
