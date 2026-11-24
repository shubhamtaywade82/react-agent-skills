---
name: auth-session-boundaries
description: Use when session state, silent refresh, protected routes, role-based UI, CSRF, token renewal, or 401/403 handling must be modeled as explicit boundaries — keeping authentication, authorization, and presentation separate with server-side enforcement.
license: MIT
---

# Auth Session Boundaries

## Purpose

Three questions hide inside "auth" and must stay separate: authentication (who is this subject — the server's answer from a cookie/token), authorization (what may this subject do — always the server's enforcement), and presentation (what the UI hides by default — a UX convenience with zero security value). The browser side of the contract owns session lifecycle: carry the credential, refresh it safely, distinguish expired from forbidden, and clean up completely on logout — without ever becoming the place where permission is decided.

## Activate when

- implementing login/logout, token storage, or session lifecycle;
- adding or repairing silent/interactive token refresh;
- building protected routes, role-based UI, or redirect-after-login flows;
- wiring 401 vs 403 handling, CSRF protection, or unauthorized error paths;
- auditing where credentials live (cookies vs web storage) and what logout actually clears.

## Repository inspection

Inspect the backend auth contract (cookie vs token, session lifetime, sliding vs absolute expiry), the refresh endpoint and its response shape, CSRF mechanism, route guards and how they resolve session state, authorization checks on the client (and whether any pretend to be enforcement), the API client's error handling for 401/403, and existing tests for expired-session and refresh-failure paths.

## Decision rules

- Authentication is who; authorization is what; UI visibility is neither — hiding an element is presentation, the server 403 is enforcement.
- The server remains authoritative: a client-side "role check" may gate navigation, never data. Protected data must require the protected API call.
- Prefer httpOnly + `Secure` + `SameSite` cookies over readable web storage for session credentials; anything in localStorage is readable by every script that ever runs (one XSS = session theft).
- Session expiry is an explicit state transition (active → refreshing → re-authenticating), not an error scattered through components.
- Refresh must be single-flight: one in-flight refresh request shared by all concurrent callers; refresh failure lands in re-authentication, not a refresh storm.
- 401 (unauthenticated/expired) triggers the session flow; 403 (forbidden) is a terminal permission answer — never loop or refresh on 403.
- Logout is complete cleanup: memory state, query caches, offline storage, and any non-httpOnly artifacts — then the server-side revocation, then redirect.
- CSRF protection follows the credential mechanism: cookies need SameSite/CSRF tokens; bearer tokens in headers are not CSRF-targeted but need XSS discipline instead.

## Implementation procedure

1. Map the session lifecycle states (anonymous, authenticated, refreshing, expired) and the transitions between them; own them in one place (a session module/store).
2. Wire the API client: on 401 → single-flight refresh → retry original request once; on refresh failure → transition to re-authentication; on 403 → surface forbidden, no retry.
3. Gate routes on session state for UX; verify the protected data itself is only reachable through authenticated API calls.
4. Render role-based UI from server-backed claims, labeled as presentation; keep an audit list of what the UI hides vs what the server enforces.
5. Implement logout as a checklist (memory, caches, storage, server revocation, redirect) and test each item.

**Reference example** — single-flight refresh and the 401/403 split in an API client:

```ts
let refreshInFlight: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshInFlight ??= fetch("/auth/refresh", { method: "POST", credentials: "include" })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => { refreshInFlight = null; });   // clear AFTER all sharers consumed it
  return refreshInFlight;                          // 20 concurrent 401s -> one refresh request
}

export async function authFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, { ...init, credentials: "include" });
  if (res.status !== 401) return res;              // 403 falls through: forbidden is terminal
  const refreshed = await refreshSession();
  if (!refreshed) { sessionStore.transitionTo("reauthenticate"); throw new SessionExpiredError(); }
  return fetch(input, { ...init, credentials: "include" });   // retry the original request exactly once
}
```

Session state lives in one store the router and UI read from — components never parse tokens or timestamps to guess expiry. Logout: `sessionStore.clear()` (memory), query-cache invalidation, `localStorage`/`sessionStorage` sweep for app artifacts, `POST /auth/logout` (server revocation, httpOnly cookie clearing happens server-side), then redirect to the login route with a `returnTo` path.

## Anti-patterns / failure modes

- Client-only authorization — hiding the admin button while the admin API has no server-side check.
- Tokens in localStorage "for simplicity" — any XSS reads them; httpOnly cookies or memory+refresh (with XSS discipline from `browser-security-dom-safety`) are the contract.
- Refresh storms: every 401 triggers its own refresh request; the expired session hammers the auth server, or N concurrent failures log the user out N times.
- Infinite retry loops — refresh succeeds but the retried request 401s again (clock skew, wrong retry predicate), looping forever.
- Treating 403 as an expired session — refreshing on forbidden loops users into login for a permission answer.
- Stale session UX: logged-out user's cached data still rendered from the query cache after logout.
- Optimistic privilege changes — the UI shows the elevated state before the server confirms, and rollback never happens.
- Redirect loops between the login route and the guard when `returnTo` handling is missing.
- Logout that clears memory but not server-side revocation — a "logged out" token still works.

## Verification

Test the lifecycle end to end: expired session → single 401 → one refresh → original request retried; concurrent 401s produce exactly one refresh call; refresh failure → re-authentication state with `returnTo` preserved; 403 surfaces forbidden without refresh or redirect; logout clears memory, caches, and storage (assert each), revokes server-side, and no protected data renders afterwards; login redirect carries `returnTo` and never loops. Run the full suite plus the auth-specific fixtures.

## Source foundation

- OWASP Session Management Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- MDN `Set-Cookie` (httpOnly, Secure, SameSite): https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
- RFC 6265 (HTTP State Management Mechanism): https://datatracker.ietf.org/doc/html/rfc6265
- OWASP Cross-Site Request Forgery (CSRF) Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
