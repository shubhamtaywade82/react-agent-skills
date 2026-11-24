---
name: browser-security-dom-safety
description: Use when code reads from the DOM, URL, storage, postMessage, clipboard, drag-and-drop, HTML, iframe content, or browser-integrated APIs, and attacker-controlled content could reach a dangerous sink.
license: MIT
---

# Browser Security & DOM Safety

## Purpose

Every value that did not originate in your code — URL parameters, storage contents, postMessage payloads, iframe documents, clipboard data — is attacker-controlled until validated. The security model is a data-flow discipline: know each source, constrain each transform, and keep each sink (HTML parsing, URL navigation, message handlers, persistence) either inherently safe or behind an explicit, reviewable contract. The browser cannot be trusted to sanitize for you, and neither can the string the attacker sent.

## Activate when

- rendering or inserting data that includes user-controlled content into the DOM;
- building, parsing, or validating URLs for navigation or resource loading;
- receiving `postMessage` / broadcast-channel / iframe messages;
- persisting or reading localStorage/sessionStorage/IndexedDB;
- configuring CSP, iframe `sandbox`/`allow` attributes, or embedding third-party content;
- handling clipboard, drag-and-drop, or file inputs.

## Repository inspection

Identify every data source (URL, storage, messages, clipboard), every sink (`innerHTML`/`outerHTML`, `document.write`, `eval`, `href`/`src` assignments, `window.open`, style injection), every existing sanitizer/encoding helper and its contract, the CSP configuration, iframe sandbox policies, and message schemas. Map source → transform → sink explicitly for each dangerous boundary; unmapped paths are the vulnerability.

## Decision rules

- Prefer APIs that do not parse HTML: `textContent`, `createElement` + text assignment, framework-escaped rendering (`{value}` in React, never `dangerouslySetInnerHTML` with unsanitized data).
- HTML insertion requires an explicit sanitizer contract: a maintained sanitizer at the single choke point, never string-regex "escaping".
- `postMessage` is a protocol: validate `event.origin` against an allowlist and validate payload shape (schema, not truthiness) before use; never `event.origin === "*"`.
- URLs: encode dynamic components with `encodeURIComponent` (component) vs `encodeURI` (whole URL) correctly; reject `javascript:`/`data:` schemes for navigation targets by allowlisting `http(s):` and app routes.
- Storage contents are untrusted external data that happens to persist — validate on read as if another process wrote it (including a compromised extension or XSS from the past).
- Prototype pollution: validate keys before merging user-controlled objects into plain objects (`__proto__`, `constructor` are keys too); prefer `Map` for uncontrolled key spaces.
- iframes: constrain `src` origins, set `sandbox` to the minimum capability set, and treat `contentDocument` as hostile unless same-origin and trusted.
- CSP is a defense-in-depth floor (no `unsafe-inline` for scripts, explicit origins), not the primary fix — the primary fix is the sink discipline.

## Implementation procedure

1. Inventory the boundary: source, every transform, the sink, and the security invariant that must hold.
2. Choose the inherently safe API where one exists; isolate the dangerous sink behind a named function if it cannot be avoided.
3. Validate/encode at the boundary closest to the sink, with the schema of what is allowed (allowlist, not denylist).
4. Make the choke point reviewable: one `safeHtml()` / `buildUrl()` / `handleMessage()` utility, not sink calls scattered through components.
5. Add adversarial tests: the payload that would exploit the naive implementation must fail.

**Reference example** — three boundaries, each with an explicit contract:

```ts
// 1. URL building — component encoding + scheme allowlist
function buildOrderUrl(base: string, params: Record<string, string>): URL {
  const url = new URL(base);
  if (!["https:", "http:"].includes(url.protocol))   // rejects javascript: tricks in base too
    throw new Error(`blocked scheme: ${url.protocol}`);
  for (const [k, v] of Object.entries(params))
    url.searchParams.set(k, v);                      // URLSearchParams encodes components correctly
  return url;
}
// encodeURIComponent for path segments built by hand:
const seg = encodeURIComponent(userProvidedName);     // "/" and "?" become literal text, not structure

// 2. postMessage — origin allowlist + payload schema
const TRUSTED_ORIGINS = new Set(["https://app.example.com"]);
window.addEventListener("message", (event) => {
  if (!TRUSTED_ORIGINS.has(event.origin)) return;    // ANY origin can send; origin check is mandatory
  const parsed = MessageSchema.safeParse(event.data);
  if (!parsed.success) return;                       // shape validated before any use
  handleMessage(parsed.data);
});

// 3. The single HTML choke point — sanitizer-gated, everything else uses textContent
import DOMPurify from "dompurify";
export function safeHtml(trustedTemplate: string, data: Record<string, string>): string {
  // interpolate plain values, then sanitize the RESULT — never concatenate into innerHTML directly
  const html = interpolate(trustedTemplate, data);
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "br", "p"] });
}
```

Storage read-back follows the same rule as `postMessage` payloads: `JSON.parse(localStorage.getItem(key))` is parsed untrusted input — schema-validate before use, and never let a persisted object merge into application state without key validation (prototype pollution).

## Anti-patterns / failure modes

- `innerHTML = ...` with any interpolated value, "escaped by the template" — template escaping rules are not HTML-escaping rules.
- `href = userInput` or `window.open(userInput)` — `javascript:` URLs execute; redirects become open redirector endpoints.
- `event.origin === event.source.origin`-style checks, or accepting `postMessage` from `*` — any window (ad iframe, other tab) can send.
- Regex "sanitizers" for HTML — the browser's parser wins every parser-differential game.
- Reading localStorage into app state as trusted — a past XSS or a shared machine wrote it.
- Deep-merging user-controlled JSON into config objects — `__proto__` pollution reaches every object in the app.
- `sandbox` omitted (or `allow-scripts allow-same-origin` together) on third-party iframes — the sandbox becomes decorative.
- Treating CSP as the fix — with `unsafe-inline` scripts it is theater; without sink discipline it is a wall around an unlocked door.

## Verification

Adversarial tests per boundary class: HTML payloads (`<img src=x onerror=...>`, `javascript:` hrefs, encoded variants) must render as text or be rejected by the sanitizer contract; URL builders must reject hostile schemes and encode structural characters; message handlers must ignore wrong-origin and malformed payloads; storage read-back must reject schema-invalid and pollution-keyed objects. Run available security linting and static checks; keep the choke-point utilities under contract tests so refactors cannot quietly bypass them.

## Source foundation

- OWASP XSS Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- MDN `Window.postMessage` (origin checking): https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
- MDN `innerHTML` (insecurity note) and safe alternatives: https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
- MDN Content-Security-Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
- MDN iframe `sandbox`: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
