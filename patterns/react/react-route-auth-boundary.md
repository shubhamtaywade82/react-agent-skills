# React Route Authorization Boundary

## Problem
The UI redirects or hides controls and treats that as sufficient authorization.

## Rule
Client routing improves UX; the server remains authoritative for permission enforcement.

## Implementation
Use route guards for navigation behavior while handling 401/403 responses from the protected resource independently.

## Verification
Test authenticated, unauthenticated, and authenticated-but-forbidden paths against the real API boundary.
