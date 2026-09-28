---
name: react-hook-form
description: Apply React Hook Form conventions for uncontrolled inputs, field registration, validation, submission and accessible errors when the library is present.
---

# React Hook Form Adapter

## Activate when

Activate only when React Hook Form is installed and used.

## Repository inspection

Inspect useForm configuration, resolver, default values, field arrays, Controller usage and error rendering.

## Decision rules

Respect the existing registration/control strategy. Do not mix uncontrolled and controlled patterns casually.

## Implementation contract

schema/defaults → registration → validation → submit → server errors → reset/retain behavior.

## Failure handling

Handle async submit failures, server field errors, default-value changes and field-array identity.

## Review

Check labels, error association, focus on invalid fields and resolver/runtime validation.

## Verification

Run form behavior and accessibility tests.
