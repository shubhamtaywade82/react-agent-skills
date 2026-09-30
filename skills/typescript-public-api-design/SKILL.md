---
name: typescript-public-api-design
description: Design stable public TypeScript APIs and exported contracts for libraries, packages, and shared application modules without coupling API design to release mechanics.
---

## Activate when
Use when adding or changing exported types, package APIs, shared component contracts, SDKs, or module boundaries.

## Repository inspection
Inspect package boundaries, exports, declaration generation, semver policy, tsconfig, module format, existing public types, and API compatibility tests.

## Decision framework
Prefer small explicit contracts. Separate input, output, and internal types when their lifecycles differ. Use discriminated unions for variants and avoid exporting incidental implementation details.

## Implementation
- Keep public names intentional and stable.
- Document required versus optional semantics.
- Avoid leaking framework-private or transport-specific types through general APIs.
- Make generic parameters earn their place.
- Preserve backward compatibility unless a breaking change is explicit.
- Keep runtime validation separate from compile-time declarations.

## Failure modes
Avoid widening exports accidentally, relying on structural compatibility for semantically distinct values, and using deprecated aliases as a permanent substitute for migration.

## Review
Check exports, declaration output, dependency direction, versioning implications, and downstream call-site impact.

## Verification
Run declaration/typecheck builds and focused consumer tests where available. Exercise old and new call shapes when compatibility is required.
