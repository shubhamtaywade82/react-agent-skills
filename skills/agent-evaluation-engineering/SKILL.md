---
name: agent-evaluation-engineering
description: Design agent evals that separate execution success from correctness, scope discipline, safety and recovery behavior.
---

# Agent Evaluation Engineering

## Activate when

Activate when creating or changing benchmark cases, fixture repositories, evaluators, hidden checks, multi-turn tasks, adversarial tasks or agent scoring.

## Boundary with related skills

- Use `agent-behavior-scoring` to consume this skill's verifier results; this skill owns the case contract, that owns the scorecard.
- Use `agent-adversarial-evaluations` for hostile repository content; this skill owns the neutral corpus contract.
- Use `agent-multi-turn-evaluations` when the scenario spans sequential turns; this skill owns the single-turn contract.
- Use `agent-workflow` for the repository loop the evals measure.

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

**Reference example** — one fixture case in the contract's shape (initial state → prompt → scope → verifiers → outcome):

```yaml
# evals/react-typescript/cart-optimistic-update.yml
case: cart-optimistic-update
fixture: ecommerce-storefront            # fixture root with seeded state
prompt: "Add optimistic updates to the cart quantity stepper"
allowed_paths: [src/cart/**, src/state/**, test/cart/**]
verifiers:                               # verifier source lives outside the agent workspace
  - test: test/cart/optimistic.test.mjs  # behavioral: pending state, rollback on 409
  - invariant: "git diff --name-only matches allowed_paths"
  - invariant: "package.json has no new dependencies"
outcome: machine-readable per-verifier pass/fail
```

The three verifier kinds are the contract: a behavioral test proves correctness, scope invariants prove discipline, and the dependency invariant proves the agent did not buy its way out. All three are independent of the agent's exit status.

## Verification

Run fixture schema validation, evaluator contract tests and representative fixture executions; inspect raw per-verifier and per-turn evidence.
