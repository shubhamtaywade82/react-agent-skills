---
name: testing-library
description: Apply Testing Library conventions for accessible, user-centric React tests only when the library is detected.
---

## Activate when
Activate only when Testing Library packages or setup are present.

## Repository inspection
Inspect render helpers, user-event setup, queries, async utilities, custom matchers, and provider wrappers.

## Decision framework
Test user-visible behavior through accessible queries and realistic interactions. Avoid implementation details unless a public contract truly requires them.

## Implementation
- Prefer role, label, text, and other resilient queries.
- Use user-event style interactions where supported.
- Await visible asynchronous outcomes.
- Keep custom render wrappers focused.

## Failure modes
Watch for test-id overuse, manual event dispatch, arbitrary sleeps, and assertions against private component state.

## Review
Check whether failures point to user-visible regressions.

## Verification
Run focused component tests and the full configured test suite.
