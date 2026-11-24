---
name: react-routing
description: Use for framework-agnostic React route design, navigation, URL-driven state, route params, guards, and deep-link behavior.
license: MIT
---

# React Routing

## Purpose

Treat the URL as an application contract: every route must load directly from a blank tab, survive refresh and sharing, and fail safely. Routing is where identity, authorization, and state-ownership meet the browser's history machinery — get it right once and deep links, back buttons, and shared URLs all work; get it wrong and the app becomes a stateful maze that only works if you navigate the "happy path" the author happened to test.

## Activate when

- adding routes or changing nested layouts and route params;
- moving application state into (or out of) the URL;
- implementing auth/authorization navigation, guards, or redirects;
- diagnosing routes that break on direct load, refresh, or back-button.

## Boundary with related skills

- Use `auth-session-boundaries` for the session lifecycle (login, returnTo, expiry) the guards sit on.
- Use `react-error-resilience` for route-level failure states (loader errors, not-found boundaries).
- Use `react-state-management` for the ownership rule: URL-owned state is never duplicated in app state.
- Use `react-server-components` when routing integrates with server components/loaders in RSC setups.

## Repository inspection

Inspect the routing library and its conventions (React Router, TanStack Router, or a framework's file-based system), the route tree and layout nesting, loaders/data dependencies per route, error and not-found routes, parameter parsing conventions, redirect logic, and the auth boundary placement (guard vs resource). Check the params-vs-search-params split: path segments for identity, query string for view state.

## Decision rules

- State belongs in the URL when sharing, reload, bookmarking, or back/forward matters — filters, tabs, pagination, selected item; never duplicated in app state.
- Route params are untrusted input: decode, validate, and type them at the route boundary before any use.
- Authentication establishes identity; authorization decides access — hiding a link is presentation, the route guard is UX, and the server's answer on the data is the enforcement.
- Redirects carry explicit, validated targets: `returnTo` allowlisted against app routes (no open redirects), and loops structurally impossible (guard checks arrive-from, not just is-authed).
- Every route defines its failure routes: not-found, loader-error boundary, and the unauthorized state — defaulting to a blank screen is a bug.
- Deep links are first-class: any (route, params, search) triple reproduces the exact screen from cold start.

## Implementation procedure

1. Write the route contract: paths, params, search state, and which data each route needs.
2. Mark the access boundary per route: public / authenticated / role-authorized.
3. Validate and parse params at the boundary; invalid params resolve to the not-found/error route, not a broken render.
4. Implement guards with safe redirects (validated `returnTo`), and loader/permission failures to their error boundaries.
5. Test cold-start direct loads for every route, back/forward transitions, invalid params, and the guard loop scenarios.

**Reference example** — a route table with validated params, a guard with safe returnTo, and URL-owned state:

```tsx
// Route params are untrusted: the contract is the validated parse, not the string.
const Routes = {
  order: { path: "/orders/:orderId", parse: (p: Record<string, string>) => {
    const orderId = z.string().uuid().safeParse(p.orderId);
    return orderId.success ? { orderId: orderId.data } : null;    // null → not-found boundary
  }},
};

// Guard: identity from the session store; target validated before redirecting.
function RequireAuth({ children }: { children: ReactNode }) {
  const session = useSession();
  const location = useLocation();
  if (session.state === "anonymous") {
    const returnTo = location.pathname + location.search;
    // Allowlist check: only app-relative, non-login paths survive the round trip.
    const safe = returnTo.startsWith("/") && !returnTo.startsWith("//") && !returnTo.startsWith("/login");
    return <Navigate to={`/login?returnTo=${encodeURIComponent(safe ? returnTo : "/")}`} replace />;
  }
  return children;
}

// URL-owned state: filters live in the search params, not in a parallel useState.
const [searchParams, setSearchParams] = useSearchParams();
const status = searchParams.get("status") ?? "all";               // share/reload/back all correct
const setStatus = (s: string) => setSearchParams((prev) => {      // single owner: the URL
  const next = new URLSearchParams(prev);
  s === "all" ? next.delete("status") : next.set("status", s);
  return next;
});
```

Three disciplines in one place: params validated before use, redirects allowlisted against open-redirect abuse, and view state owned by the URL alone.

## Anti-patterns / failure modes

- Routes that only work after client-side navigation — cold links 404 or render broken (history API needs server/SPA-fallback cooperation).
- Hiding unauthorized links while the route renders anyway — presentation mistaken for enforcement.
- Open redirects via unvalidated `returnTo`/`next` — phishing hosted from your own login page.
- Redirect loops: login → guard → login (returnTo not respected or arrival-from not tracked).
- Params trusted as strings and passed to APIs unparsed — the route is an attack surface.
- URL state duplicated into `useState` — two owners, share-links and back-button drift.
- Missing error/not-found routes — invalid params and loader failures render blank screens.
- Lost state on refresh: search params written but never read back, or written with unencoded values.

## Agent review checklist

- Can every route load directly from a blank tab with shareable URLs?
- Are params validated and typed at the route boundary?
- Is authorization enforced at the resource (server) boundary, with guards as UX only?
- Are redirect targets validated against an allowlist; are loops structurally impossible?
- Is URL-owned state single-owner (no parallel app-state copy)?

## Verification

Cold-start direct navigation tests for every route (deep links, invalid params → not-found), back/forward transition tests, guard tests (anonymous → login with preserved returnTo, authorized → through, expired → re-auth without loop), and the build verification that SPA fallback/route config actually serves the direct loads.
