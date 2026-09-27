---
name: react-async-ui
description: Design explicit async UI states including initial load, refresh, mutation, empty, error, retry, cancellation, and stale-data behavior.
---

## Activate when
Use when a component consumes async data, submits mutations, refreshes content, or changes behavior based on loading and error state.

## Repository inspection
Inspect data-fetching library, query and mutation conventions, existing state model, error boundaries, retry policy, skeleton/loading patterns, and test helpers.

## Decision framework
Separate initial load from background refresh and mutation state when the user experience differs. Do not collapse empty, error, loading, and stale-success states into one boolean.

## Implementation
- Make visible state transitions explicit.
- Preserve usable stale data during background refresh when safe.
- Disable or deduplicate actions only when concurrent mutations are unsafe.
- Surface retryable versus terminal failures appropriately.
- Handle cancellation and stale responses without corrupting visible state.

## Failure modes
Watch for loading flicker, error replacement of valid stale data, duplicate submissions, retry loops, and success UI that races with a newer request.

## Review
Check the state matrix, accessibility of status changes, race handling, and consistency with data-cache semantics.

## Verification
Test initial loading, success, empty, refresh, mutation, failure, retry, and stale-response cases with realistic user interactions.
