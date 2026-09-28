---
name: graphql-codegen
description: Govern GraphQL Code Generator configuration and generated TypeScript artifacts without hand-editing output.
---

# GraphQL Codegen Adapter

## Activate when

Activate only when GraphQL Code Generator config/scripts are present.

## Repository inspection

Inspect schema sources, documents, config presets/plugins, generated output and CI generation commands.

## Decision rules

Schema and operation documents are authoritative. Generated TypeScript is disposable output.

## Implementation contract

schema/documents/config → code generation → generated types/hooks → consuming package.

Keep generated output reproducible and version-pinned.

## Failure handling

Handle schema drift, stale generation, plugin version mismatches and generated-file churn.

## Review

Check generated ownership, config scope and runtime/document alignment.

## Verification

Run code generation from a clean state and typecheck affected consumers.
