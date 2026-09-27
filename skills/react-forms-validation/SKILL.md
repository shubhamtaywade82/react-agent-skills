---
name: react-forms-validation
description: Use when building forms, multi-step workflows, validation, field errors, and submission behavior.
---

# React Forms and Validation

## Purpose
Make form state, validation, submission, and error ownership explicit while preserving accessible recovery.

## Activate when
- creating/modifying forms;
- adding client/server validation;
- implementing wizards or complex submission flows.

## Repository inspection
Inspect form library conventions, schema validation, field components, API error shapes, validation timing, focus handling, autosave, and duplicate-submit prevention.

## Decision rules
- Separate validation errors from transport/system failures.
- Enforce authoritative business rules on the server.
- Preserve user input on recoverable submission failure.
- Keep field names and error identifiers stable.
- Announce errors appropriately and manage focus intentionally.

## Implementation procedure
1. Define form state.
2. Identify synchronous versus server rules.
3. Normalize server errors.
4. Prevent unsafe duplicate submissions.
5. Preserve input and provide recovery.
6. Test keyboard submit, invalid fields, server rejection, success, and retry.

## Anti-patterns / failure modes
- browser-only validation for server rules;
- clearing input on failure;
- generic errors when field details are known;
- inaccessible error messages.

## Agent review checklist
- Which layer owns each rule?
- Can users locate and recover from errors?
- Are validation and transport failures distinct?
- Is submission idempotency addressed?

## Verification
Accessible form tests, validation tests, API error mapping tests, typecheck, and integration tests.
