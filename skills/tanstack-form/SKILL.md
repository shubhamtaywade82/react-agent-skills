---
name: tanstack-form
description: Apply TanStack Form conventions for field state, validators, async validation, submission and form-level errors when present.
---

# TanStack Form Adapter

## Activate when

Activate only when TanStack Form is installed and used.

## Repository inspection

Inspect form/field composition, validator definitions, submission lifecycle and schema integration.

## Decision rules

Keep validation and submission ownership explicit. Avoid duplicating TanStack Form state in React state.

## Implementation contract

field/form state → validation → submission → server result → recovery.

## Failure handling

Handle async validation races, server errors, touched/dirty state and reset semantics.

## Review

Check accessible errors, submission status and validator runtime behavior.

## Verification

Run form unit/integration and accessibility tests.
