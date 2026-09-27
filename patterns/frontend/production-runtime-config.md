# Frontend Runtime Configuration Boundary

## Problem
A build-time environment value cannot be changed between deployments without rebuilding the frontend.

## Rule
Choose build-time versus runtime configuration deliberately and document the lifecycle.

## Implementation
Expose only non-secret client configuration. Validate shape and required values at startup, and keep runtime-loaded config behind a stable boundary.

## Verification
Test malformed and missing config plus a deployment-equivalent production build.
