---
name: react-observability
description: Use for frontend logging, metrics, tracing, error telemetry, performance telemetry, and privacy-aware diagnostic context.
---

# React Observability

## Purpose
Instrument meaningful user/system behavior without creating privacy, reliability, or performance problems.

## Activate when
- adding client telemetry;
- instrumenting errors/performance;
- correlating UI events with backend operations.

## Repository inspection
Inspect telemetry provider, naming conventions, correlation IDs, sampling, redaction, error boundaries, source maps, and privacy requirements.

## Decision rules
- Instrument diagnostic boundaries, not every render.
- Never log secrets or unnecessary personal data.
- Keep telemetry payloads minimal.
- Sample high-volume signals intentionally.
- Telemetry failure must not break critical product flows.

## Implementation procedure
1. Define the diagnostic question.
2. Choose event/span/error boundary.
3. Minimize payload.
4. Add redaction and sampling.
5. Ensure non-blocking behavior.
6. Test the emitted contract.

## Anti-patterns / failure modes
- full API response logging;
- render-level telemetry explosions;
- telemetry exception taking down UI;
- unnecessary identifying data in events.

## Agent review checklist
- What question does this signal answer?
- Is the payload minimal and safe?
- What is the volume/cost?
- Can telemetry failure affect the product?

## Verification
Event contract tests, redaction checks, and production configuration review.
