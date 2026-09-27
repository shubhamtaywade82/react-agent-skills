# Security Open Redirect Boundary

## Problem
A return URL from a query parameter is used directly after login.

## Rule
Redirect destinations from untrusted input must be constrained.

## Implementation
Allow only approved same-origin paths or explicit origin allowlists. Reject dangerous schemes and unexpected hosts.

## Verification
Test relative paths, encoded redirects, external hosts, executable schemes, and missing return URLs.
