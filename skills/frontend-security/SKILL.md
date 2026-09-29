---
name: frontend-security
description: Apply frontend security controls across XSS, CSRF, token handling, content trust, browser isolation, third-party scripts, and supply-chain boundaries.
---

## Activate when
Use for security-sensitive frontend changes, auth/session flows, HTML rendering, URL handling, third-party integrations, browser storage, or dependency additions.

## Repository inspection
Inspect authentication/session mechanism, CSP, cookie attributes, CSRF strategy, HTML sanitization, URL construction, security headers, third-party scripts, dependency policy, and telemetry data handling.

## Decision framework
Treat browser input, URL data, storage, API responses, and third-party content as untrusted. Keep authorization server-side. Prefer platform controls such as HttpOnly, Secure, and SameSite cookies and CSP where the application model supports them.

## Implementation
- Keep secrets and long-lived privileged tokens out of client storage and bundles.
- Sanitize untrusted HTML at a dedicated boundary.
- Validate and encode URLs and redirect targets.
- Preserve CSRF and session protections across mutations.
- Constrain third-party code and permissions.
- Avoid logging tokens, personal data, or full request payloads.

## Failure modes
Watch for DOM XSS, open redirects, token leakage, unsafe postMessage handling, CSRF regressions, insecure storage, and dependency typosquatting or unexpected code execution.

## Review
Trace attacker-controlled data from source to sink. Verify browser, server, and dependency boundaries independently.

## Verification
Use security-focused tests and static tooling available in the repository. Inspect built artifacts when exposure or injection is plausible.


## Progressive disclosure

Read `references/browser-security.md` when attacker-controlled browser data reaches DOM, URL, storage, messaging, third-party script or telemetry boundaries.
