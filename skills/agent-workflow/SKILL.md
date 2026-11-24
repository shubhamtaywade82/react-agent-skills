---
name: agent-workflow
description: Use for any non-trivial React or TypeScript repository change to drive inspection, implementation, verification, and evidence reporting.
---

# Agent Workflow

## Purpose
Make agent work deterministic: inspect first, choose bounded skills, implement a coherent slice, verify at the owning boundary, and report evidence.

## Boundary with related skills

- Use `agent-tool-capabilities` before planning when the tool surface is unknown — the workflow's verification step depends on what is actually available.
- Use `agent-evaluation-engineering` when the repository change IS an eval change; this skill owns the operating loop, that owns the corpus contract.
- Use `react-testing-engineering` and `frontend-e2e` for what "verified" means in this repository; this skill only sequences the evidence.
- Domain skills (`react-*`, `typescript-*`, `frontend-*`) own the change itself; this skill owns inspect → implement → verify → report.

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

**Reference example** — the evidence report the loop produces (observed results, unrun checks disclosed):

```md
Task contract: add optimistic updates to the cart quantity stepper (React 19, no new deps).

Skills routed: react-data-fetching (cache mutation), react-async-ui (pending states),
react-testing-engineering (user-event tests), agent-workflow (this loop).

Evidence:
- focused: user-event tests for the stepper — 6/6 pass (vitest, 1.2s)
- typecheck: tsc --noEmit clean
- lint: eslint clean
- full suite: 39/39 pass
- not run: browser e2e (no browser capability in this session) — disclosed
```

The report is the contract with the reviewer: every claim is an observed result, and the gap between "verified" and "not verified" is explicit, never implied.

## Verification
Run the narrowest useful test first, then typecheck/lint/test/build according to repository configuration.
