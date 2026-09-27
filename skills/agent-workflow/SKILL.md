---
name: agent-workflow
description: Use for any non-trivial React or TypeScript repository change to drive inspection, implementation, verification, and evidence reporting.
---

# Agent Workflow

## Purpose
Make agent work deterministic: inspect first, choose bounded skills, implement a coherent slice, verify at the owning boundary, and report evidence.

## Activate when
- starting a feature, bug fix, refactor, or review;
- changing architecture, dependencies, or CI.

## Repository inspection
Read package manager and lockfile, package scripts, React/TypeScript/framework versions, tsconfig, lint/test/build configuration, source layout, deployment assumptions, and local conventions.

## Decision rules
- Existing repository conventions outrank generic preferences unless they violate a concrete requirement.
- Establish acceptance criteria and invariants before implementation.
- Separate behavior changes from unrelated cleanup.
- Prefer incremental diffs that leave the repository buildable.

## Implementation procedure
1. Identify the task contract.
2. Route primary and dependent skills.
3. Locate owning modules and tests.
4. Add/update focused tests.
5. Implement the smallest coherent slice.
6. Run focused verification, then canonical repository checks.
7. Review scope and regressions.
8. Report observed evidence.

## Anti-patterns / failure modes
- editing before inspection;
- broad rewrites for local problems;
- silently changing product behavior;
- claiming unrun checks passed.

## Agent review checklist
- What repository evidence drove the design?
- Is each changed file necessary?
- Is the owning boundary tested?
- Are unrun checks disclosed?

## Verification
Run the narrowest useful test first, then typecheck/lint/test/build according to repository configuration.
