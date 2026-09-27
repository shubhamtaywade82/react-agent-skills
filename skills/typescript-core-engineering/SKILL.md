---
name: typescript-core-engineering
description: Use for TypeScript language semantics, strictness, modules, narrowing, generics, and compiler-level contracts.
---

# TypeScript Core Engineering

## Purpose
Use TypeScript to make invalid states harder to represent while preserving the distinction between compile-time types and runtime truth.

## Activate when
- changing TypeScript code or compiler configuration;
- resolving compiler errors;
- designing exported types/generics.

## Repository inspection
Inspect tsconfig hierarchy, TypeScript version, module system, target/lib, strictness, aliases, generated types, package boundaries, and runtime compatibility.

## Decision rules
- Prefer precise inference for locals.
- Add explicit types at public boundaries.
- Prefer discriminated unions for mutually exclusive states.
- Use unknown at untrusted boundaries.
- Isolate unavoidable any.
- Do not use assertions to conceal uncertainty.

## Implementation procedure
1. Resolve compiler/runtime constraints.
2. Model valid states.
3. Narrow deliberately.
4. Keep module ownership clear.
5. Verify public contracts.
6. Test runtime behavior separately for external data.

## Anti-patterns / failure modes
- broad any;
- assertion-heavy code;
- global strictness weakening;
- exported internal implementation details.

## Verification
Run typecheck, focused tests, lint, and the relevant production build.

## Source foundation
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/intro.html
- TSConfig: https://www.typescriptlang.org/tsconfig/
- React + TypeScript: https://react.dev/learn/typescript
