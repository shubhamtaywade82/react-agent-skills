---
name: typescript-runtime-contracts
description: Use when untrusted JSON, HTTP responses, environment values, browser storage, or dynamic JavaScript enters typed TypeScript code.
---

# TypeScript Runtime Contracts

## Purpose
Keep compile-time declarations and runtime truth separate. Validate untrusted values at deliberate boundaries before application code treats them as trusted.

## Activate when
- consuming HTTP/JSON;
- parsing environment variables or storage;
- processing dynamic JavaScript;
- adding schema or serialization contracts.

## Repository inspection
Inspect transport clients, generated types, validation libraries, error normalization, storage access, and logging/redaction.

## Decision rules
- unknown is the default for untrusted values.
- Validate once at a clear boundary, then pass trusted domain data inward.
- Keep validation failures distinct from transport failures.
- Avoid repeating schemas across consumers.
- Redact sensitive values before logging malformed payloads.
- Generated types describe expected data; they do not prove runtime data.

## Implementation procedure
1. Locate the trust boundary.
2. Define the accepted runtime shape.
3. Parse and validate.
4. Normalize transport representation when useful.
5. Test malformed, missing, unexpected, and version-drift input.
6. Verify safe caller recovery.

## Anti-patterns / failure modes
- blind casts on network responses;
- validation scattered through UI components;
- logging full invalid payloads;
- treating generated types as runtime validation.

## Agent review checklist
- Is the trust boundary explicit?
- Is external data validated before narrowing?
- Are validation and transport errors distinguishable?
- Is sensitive data redacted?

## Verification
Boundary tests for valid/invalid payloads and caller behavior after validation failures.

## Source foundation
- TypeScript narrowing: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/intro.html
