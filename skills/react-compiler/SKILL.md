---
name: react-compiler
description: Adopt and maintain the React Compiler without speculative memoization, unsafe directives, or hidden diagnostics.
---

# React Compiler

## Activate when

Activate when React Compiler configuration or diagnostics exist, when compiler adoption is planned, or when optimizing compiler-enabled React code.

## Repository inspection

Inspect React/compiler versions, framework/bundler integration, compiler configuration, compiler lint diagnostics, existing memo/useMemo/useCallback usage, directives, published library boundaries, and performance evidence.

## Decision rules

Treat compiler optimization as the default in compiler-enabled code. Do not add manual memoization merely because a component rerenders.

Use manual memo/useMemo/useCallback only when measured, semantically required for referential identity, or needed as an explicit compiler escape hatch. Do not use directives to silence diagnostics without understanding the cause.

## Implementation contract

For adoption: enable the smallest supported scope → run diagnostics → fix unsupported patterns without behavior drift → add regression/performance evidence → expand incrementally.

For cleanup: remove redundant memoization only after compiler support and behavior/performance evidence are confirmed.

## Failure handling

Escalate compiler incompatibilities, library consumers compiling differently, removal of semantically required memoization, mutable-ref behavior changes, and partial package compilation. Do not disable the compiler globally for a local incompatibility without an explicit repository decision.

## Review

Check configuration, diagnostics, directives, memoization, referential-identity contracts, library boundaries, bundle output and performance evidence.

## Verification

Run compiler/typecheck/lint and focused tests. Performance claims require before/after measurements.
