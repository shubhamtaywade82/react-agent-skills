---
name: react-rails-integration
description: Use when React/TypeScript client code talks to a Rails backend — consuming typed Rails JSON responses, validating them at the client boundary, sending CSRF tokens and session credentials from fetch, mapping Rails 422 validation errors into forms, paginating Rails collections, and co-owning the client side of the seam with ruby-agent-skills.
license: MIT
---

# React ↔ Rails Integration

## Purpose

Own the client side of the contract between a React/TypeScript client and a Rails backend so neither side assumes what the other sends. The server side of each contract belongs to `ruby-agent-skills` (its seam skill `rails-react-integration` owns the integration mode and the server fit); this skill owns the client side and the fit between the two. This skill activates only when the detected backend is Rails (`Gemfile` containing `rails`).

## Composing with ruby-agent-skills

This pack never copies Rails guidance. For a full-stack Rails + React change, split the work:

- Server side (controllers, serializers, routes, CSRF/session configuration, integration mode): `ruby-agent-skills` → `rails-react-integration`.
- Client side (fetch calls, typed response validation, error mapping, forms, pagination UI): this skill.

If ruby-agent-skills is not installed, finish the client work and report the Rails-side follow-up and its owning skill (`rails-react-integration` for the seam; `rails-action-controller` / `rails-active-record` / etc. for the domain) instead of improvising server guidance.

## Activate when

- a component, hook, or client service calls a Rails backend (fetch/axios, React Query, SWR, or an Inertia/JSON API/islands mode);
- a change touches the client/server boundary: request/response types, CSRF tokens, session cookies, SameSite handling, error envelopes, or pagination;
- a Rails backend changes its API shape and the client contract needs a matching update.

## Repository inspection

1. Detect the integration mode: Inertia, JSON API, or islands (see `rails-react-integration` on the server side; the client consumes whichever mode the Rails app chose).
2. Locate the CSRF token source (Rails UJS meta tag `csrf-token`, or a dedicated endpoint), the session cookie configuration, and the API namespace (`/api/v1` etc.).
3. Inspect the existing client data layer: fetch wrapper, query client, error handling conventions, generated or hand-written types.
4. Confirm exact Rails and React versions from lockfiles before using version-specific mechanics.

## Decision rules

- Treat every Rails response as untrusted input: validate at the boundary before it enters client state. TypeScript types do not validate JSON.
- Keep transport types separate from domain/UI types when their invariants differ.
- Never ship Rails secrets or session material into client-delivered code; the client sends credentials the browser already holds (cookies), it never stores them.
- The CSRF token is per-session, not build-time constant; read it at request time from the meta tag (or configured endpoint), never hard-code it.
- Same-origin Rails sessions travel as cookies; cross-origin setups need the Rails side's CORS + credentials configuration and a documented trust decision on the Rails side (this skill only consumes it).
- Authentication establishes identity; authorization decisions stay on the server. The client renders; it never decides.
- Prefer the smallest coherent change on the client when the server contract is stable.

## Implementation procedure

1. Locate or create the fetch wrapper that attaches `X-CSRF-Token` (read from `meta[name="csrf-token"]`) and `credentials: "same-origin"` (or `"include"` only for a documented cross-origin setup).
2. Type the endpoint contract explicitly; validate the response shape at the boundary (`unknown` in, schema/validator out).
3. Map Rails 422 validation responses (`{ errors: { field: [...] } }` or the app's error envelope) into form field errors — keep the mapping in one place per form.
4. Map non-2xx responses (401/403/404/422/500) to UI states per the repository's error-boundary and toast conventions.
5. For collections, consume the Rails pagination contract the backend actually emits (headers or envelope) and render it without inventing a different scheme client-side.
6. Add focused tests at the boundary: CSRF attach, response validation, error mapping, and pagination rendering.

## Failure modes

Avoid:
- reading the CSRF token once at module load (it rotates with the session);
- skipping response validation because "Rails serializes correctly" — serializer drift reaches the client as runtime breakage;
- shipping the CSRF token or session cookie into state, localStorage, or logs;
- mapping 422 errors by string-matching error messages instead of the field keys;
- assuming cookie delivery cross-origin without the Rails-side `credentials`/CORS configuration actually present;
- duplicating server-side authorization checks in the client and treating them as enforcement;
- hard-coding Rails routes as strings across components instead of one typed route module.

## Reference example

```tsx
// Rails sends: X-CSRF-Token meta tag + session cookie; 422 with { errors: { email: ["taken"] } }
const csrfToken = () =>
  document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? "";

export async function updateProfile(form: FormData): Promise<Result<Profile>> {
  const response = await fetch("/api/v1/profile", {
    method: "PATCH",
    headers: { "X-CSRF-Token": csrfToken(), Accept: "application/json" },
    credentials: "same-origin",
    body: form,
  });
  if (response.status === 422) {
    const { errors } = await response.json(); // validate shape before use
    return { ok: false, kind: "validation", errors };
  }
  if (!response.ok) return { ok: false, kind: "http", status: response.status };
  return { ok: true, data: Profile.parse(await response.json()) }; // unknown in, validated out
}
```

## Agent review checklist

- [ ] CSRF token read at request time, never hard-coded or cached at module scope.
- [ ] Every response validated at the boundary before entering client state.
- [ ] 422 mapping keyed by field names, tested against the Rails error envelope.
- [ ] No session material or secrets stored in client state, storage, or logs.
- [ ] Pagination consumes the contract the backend actually emits.
- [ ] Rails-side follow-up reported when the server contract must change.

## Verification

Typecheck, focused boundary tests (CSRF attach, validation, error mapping, pagination), and the repository-standard lint/test/build gates. Verify against the Rails app's actual error envelope and pagination headers rather than an assumed shape. Report exactly what was verified against the real backend contract and what remains unverified.
