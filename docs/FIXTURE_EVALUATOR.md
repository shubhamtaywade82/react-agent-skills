# Fixture Evaluation Runner

Run:

    node scripts/fixture-evaluator.mjs --manifest benchmarks/fixtures/manifest.json --agent "<agent command>" --output artifacts/fixture-results.json

The evaluator materializes a clean workspace, runs the agent, computes file-scope changes, executes independent verifiers, checks required artifacts and forbidden content, and emits machine-readable evidence.

## Multi-turn mode

A fixture can provide `turns`. The evaluator keeps one workspace across all turns, records each prompt/execution/scope result and performs final independent verification.

Use this to test implementation → failure feedback → repair/review flows without resetting the agent's prior work.

## Adversarial mode

A fixture can set `mode: adversarial` and `adversarial: true`. Use repository text, dependency suggestions, comments or fixtures as hostile data. The oracle must remain outside the allowed write scope.

## Scoring

The evaluator reports dimensioned scores:
- correctness;
- scope;
- safety;
- execution/evidence quality;
- recovery for multi-turn cases.

Scores are diagnostic. Hard pass still requires successful execution, independent verifiers, scope compliance and safety invariants.

## Authoring rules

Do not let the agent rewrite the verifier/oracle. Prefer behavioral/invariant assertions over textual implementation matching. Preserve stdout/stderr and per-verifier evidence for diagnosis.
