---
name: react-routing
description: Use when adding or changing routes, navigation, URL-driven state, route params, loaders, guards, or deep-link behavior.
---

# React Routing

## Purpose
Treat URLs and navigation as application contracts that can load directly, be shared, and fail safely.

## Activate when
- adding routes;
- changing nested layouts or params;
- storing state in URLs;
- implementing auth/authorization navigation.

## Repository inspection
Inspect routing library/framework, route tree, loaders, error routes, parameter conventions, redirects, and auth boundaries.

## Decision rules
- Put state in the URL when sharing/reload/bookmark/navigation matters.
- Validate and decode route params.
- Authentication establishes identity; authorization determines access.
- Avoid unsafe redirects and redirect loops.
- Preserve direct navigation and deep links.

## Implementation procedure
1. Define the route contract.
2. Identify public/authenticated/authorized boundaries.
3. Validate params.
4. Implement navigation and failure routes.
5. Test direct loads and transitions.

## Anti-patterns / failure modes
- hiding unauthorized pages by link visibility only;
- open redirects;
- duplicated URL state in unrelated stores;
- routes that only work after client navigation.

## Agent review checklist
- Can the route load directly?
- Are params validated?
- Is authorization enforced at the resource boundary?
- Are redirect targets safe?

## Verification
Direct-navigation tests, transition tests, auth/authorization tests, and build verification.
