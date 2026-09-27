# Security Token Storage

## Problem
A privileged token is persisted in general browser storage because it is convenient for a client library.

## Rule
Choose credential storage from the threat model and session architecture, not convenience.

## Implementation
Prefer server-managed session patterns where supported. Keep sensitive credentials out of general-purpose storage when the security model permits alternatives.

## Verification
Inspect client bundles and storage writes; test logout cleanup, session expiry, and cross-tab behavior where relevant.
