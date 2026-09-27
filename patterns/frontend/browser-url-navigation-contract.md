# Browser URL Navigation Contract

## Problem
Client navigation and browser history drift apart because state is duplicated elsewhere.

## Rule
URL state is a public navigation contract.

## Implementation
Serialize only durable, shareable state into the URL. Preserve back/forward semantics and validate decoded values before use.

## Verification
Test deep links, reloads, back/forward navigation, malformed URLs, and external navigation boundaries.
