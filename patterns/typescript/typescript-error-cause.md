# TypeScript Error Cause Preservation

## Problem
An adapter catches arbitrary thrown values and loses the original cause while normalizing the error.

## Rule
Normalize at the boundary, but preserve provenance and distinguish expected operational errors from unknown programmer faults.

## Implementation
Accept unknown, normalize to a stable domain error shape, and preserve the original cause where supported. Do not stringify away structured metadata.

## Verification
Test native Error, non-Error throws, network failures, cancellation, and nested causes.
