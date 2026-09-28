---
name: browser-authentication
description: Implement browser authentication flows with explicit cookie/token, CSRF, refresh, logout and session-expiry contracts.
---

# Browser Authentication

## Activate when

Activate for login/logout, session bootstrap, refresh tokens, cookie authentication, MFA steps or browser auth redirects.

## Repository inspection

Inspect server contract, cookie attributes, token transport, CSRF strategy, refresh ownership, route guards and logout propagation.

## Decision rules

Authentication proves identity; authorization controls access. Prefer secure, server-managed session mechanisms appropriate to the architecture. Never expose secrets in client logs or UI state.

## Implementation contract

anonymous → authenticating → authenticated → refreshing → expired/logout

Handle concurrent refresh without duplicated or conflicting session state.

## Failure handling

Cover invalid credentials, expired sessions, refresh failure, CSRF rejection, revoked sessions and logout races.

## Review

Check cookie flags, storage, redirects, CSRF, cache isolation and sensitive telemetry.

## Verification

Use integration/browser tests for login, refresh, protected navigation and logout/session expiry.
