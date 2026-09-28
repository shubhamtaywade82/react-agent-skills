---
name: typescript-build-architecture
description: Design TypeScript build graphs with project references, composite boundaries, incremental compilation and explicit declaration outputs.
---

# TypeScript Build Architecture

## Activate when

Activate for slow TypeScript builds, monorepos, multiple tsconfig files, project references, declaration generation, incremental compilation, or editor memory problems.

## Repository inspection

Inspect tsconfig inheritance, references, rootDir/outDir, composite/incremental settings, package boundaries, path aliases, declaration output, build scripts and package graph.

## Decision rules

- Use project references when the repository has coherent independently buildable TypeScript packages/apps.
- Keep referenced projects discoverable and acyclic.
- Separate source and emitted artifacts.
- Use build mode for graph-aware compilation.
- Do not introduce references simply to hide circular dependencies or compiler errors.
- Keep package declarations aligned with the public export surface.

## Implementation contract

Model the chain: package graph → tsconfig graph → build order → emitted artifacts.

For each project define ownership of source, declarations, tests and generated files. Verify clean and incremental builds separately when build performance is part of the task.

Avoid path aliases that work in the compiler but fail at runtime or package consumers.

## Failure handling

Watch for reference build failures, stale outputs, declaration cycles, duplicate package copies, path-alias/runtime mismatches and editor resolution divergence.

## Review

Check graph direction, composite settings, emit locations, declaration integrity, incremental cache behavior, package exports and CI cache invalidation.

## Verification

Run the repository build-mode command, clean build, focused package tests, declaration/package checks and affected application typecheck.
