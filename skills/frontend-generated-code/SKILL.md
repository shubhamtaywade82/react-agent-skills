---
name: frontend-generated-code
description: Govern OpenAPI, GraphQL, SDK and other generated frontend code with clear source ownership and regeneration verification.
---

# Frontend Generated Code

## Activate when

Activate when repository files are generated from OpenAPI, GraphQL, schemas, code generators, API clients, typed SDKs or build-time generation.

## Repository inspection

Find generator configuration, source schemas, generated directories, package scripts, checked-in generated artifacts and ownership documentation.

## Decision rules

Never edit generated output as the primary fix when a generator/source schema is authoritative. Treat generated code as a reproducible artifact.

## Implementation contract

Change source/schema/config → run generator → inspect generated diff → run focused contract tests → verify generated output is reproducible.

Pin generator versions where reproducibility matters. Make generated ownership obvious through directory and documentation conventions.

## Failure handling

Handle stale output, generator version drift, partial generation, schema/code mismatch and nondeterministic output as separate failure classes.

## Review

Reject manual edits that will be overwritten, generated changes without their source change, and unexplained generated churn.

## Verification

Run the repository generation command from a clean state and compare the result with the checked-in artifact.


## Progressive disclosure

Read `references/reproducibility.md` when generated output is checked in or a generator/schema changes. After regeneration, run `node scripts/check-generated-drift.mjs <repo-root> -- <generated-path> [...]` to prove the generated paths are clean.
