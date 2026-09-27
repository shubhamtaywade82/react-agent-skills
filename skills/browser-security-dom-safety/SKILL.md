---
name: browser-security-dom-safety
description: Secure DOM sinks, URL parsing, messaging, storage, and browser capability boundaries against attacker-controlled content.
---

## Activate when
Use when code reads from the DOM, URL, storage, postMessage, clipboard, drag and drop, HTML, iframe content, or browser-integrated APIs.

## Repository inspection
Identify every data source, sink, origin check, sanitizer, encoding helper, CSP configuration, iframe sandbox policy, and message schema.

## Decision framework
Prefer text or DOM APIs that do not parse HTML. Treat postMessage as an explicit protocol with origin and payload validation. Keep dangerous sinks isolated and reviewable.

## Implementation
- Prefer textContent and framework-escaped rendering.
- Require an explicit sanitizer contract before HTML insertion.
- Validate message origin and payload shape.
- Encode dynamic URL, query, and path components.
- Validate storage contents as untrusted external data.
- Constrain iframe origins and sandbox capabilities.

## Failure modes
Watch for innerHTML injection, executable URL schemes, unsafe redirects, origin wildcard messaging, prototype pollution through parsed objects, and trust in persisted client data.

## Review
Document source, transform, sink, and security invariant for each dangerous boundary.

## Verification
Add adversarial tests for HTML, URL, message, storage, and malformed payload inputs. Run available security and static checks.
