---
name: react-server-security
description: Audit React Server Components and server-function boundaries for dependency vulnerabilities, authorization failures and secret or data disclosure.
---

# React Server Security

## Activate when

Activate for RSC, server functions/actions, framework server/client boundaries, or RSC-related dependency changes.

## Repository inspection

Inspect react-server-dom packages and lockfile versions, framework RSC implementation, server/client module graph, serialized props, server-function inputs, server-only imports, secret/config access, client bundle output, and relevant security advisories.

## Decision rules

Treat browser input → server function → authorization → privileged data → serialization → client as separate trust boundaries.

Validate and authorize every server function. Do not treat a Server Component as an authorization boundary. Keep secrets and privileged clients in server-only modules. Inspect serialized props for sensitive fields.

When a known RSC security advisory affects the dependency graph, prioritize a patched release or documented mitigation before unrelated feature work.

## Implementation contract

Verify versions → inspect server/client graph → inspect serialization → validate input → authorize → verify client output/bundle → test unauthorized/malformed/valid cases → review dependency changes.

## Failure handling

Stop on hardcoded client secrets, unchecked privileged IDs/roles/paths, UI-only authorization, leaked server errors, vulnerable RSC packages, or diagnostics exposing cookies/headers/secrets.

## Review

Require authorization/input/serialization tests, dependency evidence, and production bundle inspection where applicable.

## Verification

Run dependency/security checks, typecheck/tests/build, and server/client bundle verification. Security patch claims require lockfile evidence.
