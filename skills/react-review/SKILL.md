---
name: react-review
description: Use for React + TypeScript code review, architecture audits, technical debt analysis, and pre-merge verification.
---

# React Review

## Purpose
Review for concrete failure modes and maintainability without rewarding superficial style churn.

## Activate when
- reviewing a PR;
- auditing an existing feature;
- preparing a refactor for merge/release.

## Review order
1. Correctness and contract preservation.
2. Security and trust boundaries.
3. Accessibility.
4. State/data/effect ownership.
5. Type safety and runtime validation.
6. Error/cancellation behavior.
7. Performance evidence.
8. Test quality.
9. Scope and maintainability.

## Decision rules
- Findings should identify a concrete bug, risk, or maintenance cost.
- Prefer code/tests/build evidence over taste.
- Distinguish blockers from optional cleanup.
- Do not rewrite working code only to match a preference.

## Review checklist
- Are invalid states constrained?
- Are async races handled?
- Is authorization enforced at the real resource boundary?
- Are controls accessible?
- Are external data contracts validated?
- Are tests deterministic and behavioral?
- Did the change add unnecessary dependencies or abstractions?

## Verification
Run focused tests, typecheck, lint, build, and repository-specific checks. Record observed results.
