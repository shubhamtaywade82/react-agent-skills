---
name: frontend-security
description: Apply frontend security controls across XSS, CSRF, token handling, content trust, browser isolation, third-party scripts, and supply-chain boundaries.
license: MIT
---

# Frontend Security

## Purpose

Apply the app-wide security control set: credentials live where scripts cannot read them, attacker-controlled data never reaches dangerous sinks unvalidated, third-party code is constrained and content-verified, and the security headers are configured as code — reviewed like the feature they protect. The frontend enforces UX-grade guardrails only; every authorization decision remains server-side.

## Activate when

- making security-sensitive frontend changes or reviewing auth/session flows;
- rendering HTML, constructing URLs, or handling redirects;
- integrating third-party scripts, iframes, or SDKs;
- touching browser storage, telemetry payloads, or dependencies with code execution.

## Boundary with related skills

- Use `browser-security-dom-safety` for the sink-level detail (innerHTML, postMessage, storage read-back, prototype pollution) — this skill owns the app-wide controls and policy.
- Use `auth-session-boundaries` for the session lifecycle contract (refresh, 401/403, logout cleanup).
- Use `frontend-dependency-management` for the supply-chain evaluation ladder behind dependency additions.
- Use `frontend-production` for shipping the security headers and source-map policy.

## Repository inspection

Inspect the authentication/session mechanism (cookie attributes, token storage), CSP and other security headers, CSRF strategy, HTML sanitization boundary, URL construction and redirect targets, third-party scripts (origins, SRI, permissions), dependency policy (advisory scanning, review gates), and what telemetry/error payloads contain.

## Decision rules

- Secrets and long-lived privileged tokens never ship in the bundle or live in client-readable storage; `HttpOnly` + `Secure` + `SameSite` cookies are the default credential home.
- Untrusted HTML crosses a single sanitizer boundary; everything else renders as text via framework escaping (`{value}`, never `dangerouslySetInnerHTML` with raw data).
- URLs and redirect targets are validated against an allowlist — `javascript:` schemes and user-controlled full URLs are rejected at construction.
- CSRF protection follows the credential mechanism: cookie sessions need `SameSite` plus a CSRF token strategy; the server's answer is the enforcement, the client's job is to carry the token on every mutation.
- Third-party code is a boundary, not a given: pinned origins, `integrity` (SRI) on classic scripts, `sandbox`/`allow` on iframes, and a policy for script permission grants.
- Security headers are code (set at the host/config layer, reviewed in diffs): CSP without `unsafe-inline` for scripts, `X-Content-Type-Options`, `Referrer-Policy`, frame policy.
- Telemetry and error payloads are redacted at the boundary — the error path is where tokens and personal data leak.
- Dependency additions pass the supply-chain review (scope, maintenance, postinstall scripts) before entering the tree.

## Implementation procedure

1. Map the app's security surface: credential mechanism, mutation paths (CSRF), rendering boundaries, third-party entries, headers in force.
2. Centralize credential handling and CSRF token carriage in the API client — not per-component folklore.
3. Enforce the single sanitizer boundary for HTML; verify no raw sink bypasses it.
4. Constrain third-party code: origins pinned, SRI where classic scripts load, iframe sandbox minimal, loaded deliberately (not "the marketing team added a tag").
5. Write the security headers as config-as-code; verify them from the deployed artifact, not the intention.
6. Add adversarial tests per boundary and keep advisory scanning on with a documented exception policy.

**Reference example** — third-party script with content trust, and CSRF carried by the API client:

```ts
// Content trust: pinned origin + SRI + failure handling (classic script)
<script
  src="https://cdn.vendor.example/widget/v3.2.0/widget.js"
  integrity="sha384-<hash-of-that-exact-file>"
  crossorigin="anonymous"
  onerror="window.dispatchEvent(new Event('vendor-script-failed'))"
></script>
// A pinned version + integrity hash: a tampered or silently-upgraded file refuses to execute.

// CSRF token carriage: one place, every mutation, no per-component folklore.
let csrfToken = readMetaTag("csrf-token");                       // server-rendered meta tag
export async function apiMutate(path: string, body: unknown): Promise<Response> {
  const res = await fetch(path, {
    method: "POST",
    credentials: "include",                                      // SameSite session cookie
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
    body: JSON.stringify(body),
  });
  const fresh = res.headers.get("x-csrf-token");                 // servers rotate; the client follows
  if (fresh) csrfToken = fresh;
  return res;
}
```

The SRI hash pins the exact bytes; the CSRF wrapper makes carrying the token the default path, not a per-call decision someone forgets.

## Anti-patterns / failure modes

- Tokens in `localStorage` "for simplicity" — any XSS reads them; `HttpOnly` cookies or memory + refresh discipline instead.
- CSP as theater: `script-src 'unsafe-inline'` plus a header nobody re-reviewed after adding a new third-party tag.
- Third-party scripts from changing URLs (no pin, no SRI) — the vendor's next deploy is your supply-chain incident.
- iframes without `sandbox`, or `allow-scripts allow-same-origin` together — the sandbox becomes decorative.
- Open redirects: `?next=` forwarded to arbitrary hosts — phishing hosted from your own domain.
- CSRF token logic scattered across components — one mutation path forgets it during a refactor.
- Telemetry logging tokens or request payloads on error — the observability stack becomes the exfiltration channel.
- Advisory warnings silenced without written exceptions.

## Agent review checklist

- Where do credentials live, and can scripts read them?
- Does every mutation carry CSRF protection via the centralized client?
- Does untrusted HTML cross only the sanitizer boundary?
- Are third-party scripts pinned, integrity-checked, and minimally privileged?
- Are the security headers present, strict, and verified on the deployed artifact?
- Is attacker-controlled data traced source → sink on this change?

## Verification

Security-focused tests: sanitizer boundary rejects XSS payloads; URL builders reject hostile schemes; CSRF wrapper attaches tokens on every mutation. Static tooling and advisory scans pass with documented exceptions. Inspect built artifacts when injection or exposure is plausible (secrets, source, headers on the deployed host).

## Progressive disclosure

Read `references/browser-security.md` when attacker-controlled browser data reaches DOM, URL, storage, messaging, third-party script or telemetry boundaries.
