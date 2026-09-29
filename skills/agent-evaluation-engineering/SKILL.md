---
name: agent-evaluation-engineering
description: Design agent evaluations that separate execution success from correctness, scope discipline, safety and recovery behavior.
---

# Agent Evaluation Engineering

## Activate when

Activate when creating or changing benchmark cases, fixture repositories, evaluators, hidden checks, multi-turn tasks, adversarial tasks or agent scoring.

## Repository inspection

Inspect benchmark schema, fixture manifests, evaluator scripts, expected invariants, allowed paths and CI execution boundaries.

## Decision rules

Agent process success is not application correctness. Evaluate independently:
1. execution completed;
2. behavioral verifiers passed;
3. scope stayed within the allowed boundary;
4. required artifacts exist;
5. safety invariants hold;
6. the agent recovered when recovery is part of the scenario.

Prefer behavioral and invariant checks over superficial text matching.

## Implementation contract

A fixture models initial state → task prompt → allowed scope → agent turns → independent verifiers → safety invariants → machine-readable outcome.

Keep verifier source outside the agent workspace whenever practical. Treat this as write-scope separation, not a privilege sandbox.

## Failure handling

Never convert verifier failure into success because the agent exited zero. Preserve process, correctness, scope and safety failures separately.

## Review

Check for oracle tampering, agent-cheatable tests, missing scope controls, flaky timing, implementation-detail assertions and benchmarks that reward unnecessary edits.

## Verification

Run fixture schema validation, evaluator contract tests and representative fixture executions; inspect raw per-verifier and per-turn evidence.
