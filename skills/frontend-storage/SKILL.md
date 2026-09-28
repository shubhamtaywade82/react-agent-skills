---
name: frontend-storage
description: Design browser storage schemas for localStorage, IndexedDB and Cache Storage with versioning, validation, migration and privacy boundaries.
---

# Frontend Storage

## Activate when

Activate for localStorage, sessionStorage, IndexedDB, Cache Storage or durable client-side schemas.

## Repository inspection

Inspect stored keys/databases, serialization, version markers, migration functions, quotas, sensitive data and clear/logout behavior.

## Decision rules

Stored data is untrusted and may be stale, corrupted or manually modified. Validate at read boundaries. Do not store sensitive tokens or secrets unless the repository has an explicit, reviewed security model.

## Implementation contract

schema version → parse/validate → migrate → use → write

Migrations must be idempotent and failure-safe.

## Failure handling

Handle corrupt payloads, quota errors, schema mismatches, private browsing restrictions and stale versions.

## Review

Check data classification, expiration, logout cleanup and cross-tab consistency.

## Verification

Test fresh, previous-version, corrupt, empty-storage and quota/error paths.
