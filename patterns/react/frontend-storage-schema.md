# Frontend Storage Schema Boundary

## Problem
Persisted local storage data is read as a trusted domain object.

## Rule
Browser storage is untrusted external input and may be stale or malformed.

## Implementation
Parse unknown storage values, validate a versioned schema, handle missing/corrupt data safely, and migrate or discard unsupported versions explicitly.

## Verification
Test missing data, malformed JSON, old versions, invalid fields, and valid current data.
