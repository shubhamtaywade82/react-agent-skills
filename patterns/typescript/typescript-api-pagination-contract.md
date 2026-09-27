# TypeScript Pagination Contract

## Problem
Pagination metadata is inconsistent between endpoints or cache keys omit pagination identity.

## Rule
Pagination is part of resource identity and API behavior.

## Implementation
Model cursor or page semantics explicitly, validate bounds and continuation fields, and include all identity-defining parameters in cache keys.

## Verification
Test first page, middle page, last page, missing cursor, duplicate cursor, and empty results.
