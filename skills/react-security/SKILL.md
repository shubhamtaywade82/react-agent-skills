---
name: react-security
description: Use for XSS, authentication tokens, authorization, browser storage, URL handling, third-party content, CSP, and untrusted frontend boundaries.
---

# React Security

## Purpose
Treat browser-delivered code as exposed and keep trust boundaries explicit.

## Activate when
- handling tokens/sessions;
- rendering HTML;
- processing URL/query input;
- consuming untrusted API content;
- adding privileged frontend actions.

## Repository inspection
Inspect authentication/session architecture, token storage, CSP/security headers, HTML rendering, route guards, API clients, dependency policy, and logging.

## Decision rules
- Never ship server secrets to client code.
- Prefer architecture-appropriate session mechanisms; do not move credentials into persistent browser storage without an explicit threat-model decision.
- Authentication and authorization are separate.
- Treat API, URL, storage, and third-party content as untrusted.
- Avoid dangerouslySetInnerHTML unless a documented sanitization boundary exists.
- Encode URL components and validate redirect targets.

## Implementation procedure
1. Identify attacker-controlled inputs and sensitive sinks.
2. Trace data flow to the sink.
3. Enforce authorization at the server/resource boundary.
4. Validate/sanitize before dangerous sinks.
5. Minimize sensitive data in browser storage and logs.
6. Add abuse-oriented tests.

## Anti-patterns / failure modes
- client-only authorization;
- raw HTML rendering;
- persistent credential storage chosen for convenience;
- open redirects;
- logging secrets.

## Agent review checklist
- What is attacker-controlled?
- What is the dangerous sink?
- Where is authorization actually enforced?
- What sensitive data reaches the browser?

## Verification
Security-focused tests, dependency auditing, CSP/header checks where applicable, and boundary-level authorization tests.
