---
name: auth-session-boundaries
description: Model browser authentication and session behavior without conflating authentication, authorization, and UI visibility.
---

## Activate when
Use when implementing login/logout, session refresh, protected routes, role-based UI, CSRF, token renewal, or unauthorized error handling.

## Repository inspection
Inspect backend auth contract, cookie or token mechanism, session expiration behavior, refresh endpoint, CSRF protection, route guards, authorization checks, and existing cross-boundary tests.

## Decision framework
Authentication answers who the subject is; authorization answers what that subject may do. The browser may gate navigation or presentation, but the server remains authoritative for permission enforcement.

## Implementation
- Centralize session state and refresh behavior.
- Handle expired sessions as an explicit state transition.
- Avoid storing sensitive credentials in arbitrary web storage.
- Keep protected API failures distinguishable from generic errors.
- Prevent concurrent refresh races and infinite retry loops.
- Keep logout cleanup complete across memory, caches, and permitted client storage.

## Failure modes
Watch for token leakage, refresh storms, stale sessions, redirect loops, optimistic privilege changes, and client-only authorization.

## Review
Trace login, refresh, protected request, 401 and 403, logout, and cache invalidation behavior end to end.

## Verification
Test expired sessions, refresh success and failure, unauthorized versus forbidden responses, logout cleanup, and concurrent requests.
