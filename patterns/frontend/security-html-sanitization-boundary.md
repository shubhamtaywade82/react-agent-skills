# Security HTML Sanitization Boundary

## Problem
Untrusted HTML is rendered from a server response or CMS field.

## Rule
HTML rendering requires a dedicated, reviewed sanitization boundary.

## Implementation
Prefer escaped text. When HTML is a real product requirement, sanitize with the repository-approved mechanism, constrain allowed constructs, and keep the sink isolated.

## Verification
Include adversarial markup, URL schemes, event attributes, malformed tags, and allowed rich-text cases.
