# Browser Security Review

Use this reference when a change crosses a browser trust boundary.

## Data flow

Trace attacker-controlled data from:

URL/query/hash → router state → application state → DOM/storage/network sink.

Mark each trust transition explicitly.

## High-risk sinks

- `innerHTML`, `outerHTML`, `insertAdjacentHTML`, HTML injection helpers
- executable URLs, redirects and dynamic resource URLs
- `postMessage` and iframe communication
- client storage containing session or privileged material
- third-party scripts and dynamic script injection
- telemetry containing tokens, personal data or full payloads

## Controls

Prefer text DOM APIs and trusted rendering paths. Validate origins and message shapes. Keep authorization server-side. Use secure cookie attributes where the session model supports them. Constrain third-party capabilities and preserve CSP/security headers.

## Verification

Use focused security tests, inspect built output when exposure is plausible, and verify that security-sensitive logs/events are redacted.
