# React Form Server Error

## Problem
A failed mutation is shown only as a generic toast and the user cannot recover the field error.

## Rule
Preserve server validation semantics at the form boundary.

## Implementation
Map structured server errors to fields and form-level state without erasing unknown errors. Keep submission state explicit and prevent duplicate unsafe submissions.

## Verification
Test client validation, server field errors, server form errors, retry, cancellation, and success.
