---
name: typescript-type-design
description: Use when modeling TypeScript domain states, discriminated unions, generics, branded identifiers, utility types, or reusable APIs.
---

# TypeScript Type Design

## Purpose
Encode domain invariants in types without making the type system accidental architecture.

## Activate when
- adding domain types;
- replacing flag combinations;
- defining reusable generic APIs;
- distinguishing structurally identical primitives.

## Repository inspection
Inspect existing exported types, naming, strict nullability, generated contracts, and utility-type conventions.

## Decision rules
- Model mutually exclusive states with discriminated unions.
- Use brands only where accidental mixing is materially risky.
- Use generics for real relationships.
- Prefer narrow object types when keys are known.
- Derive small variants from stable types.
- Separate transport/domain/UI types when invariants differ.

## Implementation procedure
1. Write the valid-state table.
2. Identify discriminants/shared fields.
3. Define nullability and ownership.
4. Add compile-time contract examples.
5. Add runtime tests for serialized/user-controlled values.

## Anti-patterns / failure modes
- overlapping union members;
- Partial<T> as a domain model;
- brands everywhere;
- generic abstractions hiding the actual API.

## Verification
Typecheck-focused tests, exported API compilation checks, and runtime boundary tests.

## Source foundation
- Narrowing: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
- Generics: https://www.typescriptlang.org/docs/handbook/2/generics.html
