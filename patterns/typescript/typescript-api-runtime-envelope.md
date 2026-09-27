# TypeScript API Runtime Envelope

## Problem
Generated response types are used as if the network has already been validated.

## Rule
Transport data crosses a runtime validation boundary before domain use.

## Implementation
Parse unknown input, validate the success/error envelope, preserve status and correlation metadata, then map into domain types.

## Verification
Test malformed success payloads and each meaningful non-success response.
