---
name: agent-evaluation-engineering
description: Design agent evaluations that separate execution success from correctness, scope discipline, safety and recovery behavior.
---

# Agent Evaluation Engineering

## Activate when

Activate when creating or changing benchmark cases, fixture repositories, evaluators, hidden tests, multi-turn tasks, adversarial tasks or agent scoring.

## Repository inspection

Inspect benchmark schema, fixture manifests, evaluator scripts, existing checks, expected invariants and CI execution boundaries.

## Decision rules

Agent process success is not application correctness. Score independently:

1. execution completed;
2. required behavioral verifiers passed;
3. change scope stayed within the allowed boundary;
4. required files/artifacts exist;
5. security/safety invariants hold;
6. agent recovered from failures when the task is multi-turn.

Prefer observable invariants over textual matching.

## Implementation contract

A fixture should define:

scenario → initial repository state → task prompt → allowed scope → independent verifiers → safety invariants → expected outcome.

Verifiers must be outside the agent-controlled correctness path whenever practical. Changes to verifier files are evaluation failures.

## Failure handling

Do not convert a verifier failure to pass because the agent exited successfully. Do not mark an agent failure as a correctness failure without preserving the distinction. Record stdout, stderr, exit code and verifier evidence for diagnosis.

## Review

Check for:
- agent-cheatable tests;
- hidden dependency on implementation details;
- missing scope controls;
- flaky timing;
- verifiers that only inspect text;
- benchmarks that reward unnecessary edits;
- evaluation logic that can be modified by the agent.

## Verification

Run evaluator contract tests, validate fixture schema, execute representative fixtures with a controlled agent command, and inspect machine-readable scoring output.
