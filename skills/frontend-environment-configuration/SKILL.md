---
name: frontend-environment-configuration
description: Handle environment variables, build-time configuration, feature flags, and runtime configuration without leaking secrets or creating ambiguous modes.
---

## Activate when
Use when changing .env usage, feature flags, build modes, deployment configuration, client-exposed configuration, or runtime config loading.

## Repository inspection
Inspect framework-specific env loading, build scripts, CI variables, config files, deployment manifests, public-variable prefixes, and existing validation.

## Decision framework
Separate public client configuration from server-only secrets. Decide whether a value is build-time or runtime and make that lifecycle explicit.

## Implementation
- Validate required configuration at a runtime boundary.
- Keep secret material server-side.
- Define defaults intentionally and fail clearly for invalid configurations.
- Avoid scattering direct environment reads through feature code.
- Make staging and production differences explicit and testable.

## Failure modes
Watch for secrets bundled into client assets, silent fallbacks, configuration drift, and flags that change behavior without observability.

## Review
Check exposure, lifecycle, validation, deployment consistency, and testability.

## Verification
Test valid, missing, malformed, and environment-specific configuration. Inspect build output when secret exposure is a concern.
