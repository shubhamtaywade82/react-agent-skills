# Frontend URL Input Validation

## Problem
Route or query data is assumed to be trusted because it came from the browser URL.

## Rule
Treat URL components as untrusted input and validate them before domain use or navigation.

## Implementation
Parse and constrain IDs, enums, cursor values, and redirect targets. Encode dynamic path/query segments with the repository's URL utilities.

## Verification
Test malformed values, missing values, unexpected schemes, encoded separators, and valid boundary cases.
