# Browser postMessage Origin Boundary

## Problem
A message handler accepts arbitrary window messages because the payload has the expected shape.

## Rule
Origin and payload validation are separate requirements.

## Implementation
Check the expected origin or trusted source before parsing the payload. Validate the payload at runtime and keep accepted message types discriminated.

## Verification
Test trusted sender, unexpected origin, malformed payload, unknown message type, and replay-sensitive flows.
