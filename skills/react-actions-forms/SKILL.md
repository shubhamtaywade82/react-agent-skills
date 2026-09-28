---
name: react-actions-forms
description: Design React 19 form Actions and async submission state with explicit validation, pending, success, failure, optimistic and progressive-enhancement contracts.
---

# React Actions and Forms

## Activate when

Activate for useActionState, useFormStatus, useOptimistic, form action/formAction, async submissions, or React 19 progressive enhancement.

## Repository inspection

Inspect React version, renderer/framework, current form abstraction, validation boundary, server action support, transport, route/action conventions, and pending/error state ownership.

## Decision rules

- useActionState owns action result/state when the action is the source of truth.
- useFormStatus exposes the nearest form submission state without duplicating it.
- useOptimistic represents temporary UI state and must reconcile with authoritative results.
- form action/formAction requires verified React/runtime support.
- Client validation never replaces server validation.

## Implementation contract

Model submission as idle → pending → success | failure. For optimistic flows, model pending(optimistic) → authoritative success | rollback/failure.

Preserve entered values and accessible error associations unless reset is intentional. Prevent duplicate submission when the workflow requires it. Define behavior when JavaScript is absent or hydration is delayed.

## Failure handling

Cover validation errors, transport failures, authorization/session expiry, duplicate submissions, abort/navigation during submit, optimistic rollback, and retry.

## Review

Check labels/error association, aria-invalid, focus movement, pending controls, keyboard semantics, server validation, and persistence of useful error state.

## Verification

Test initial, pending, success, validation failure, server failure, retry, duplicate submit, and optimistic rollback behavior as applicable.
