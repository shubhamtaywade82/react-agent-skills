# Fixture Evaluation Runner

Run:

    node scripts/fixture-evaluator.mjs --manifest benchmarks/fixtures/manifest.json --agent "<agent command>" --output artifacts/fixture-results.json

The evaluator creates disposable workspace and oracle directories, materializes the fixture, runs the agent through one or more persistent turns, captures scope changes, runs independent verifiers, checks required files and forbidden content, calculates dimensioned scores, and emits machine-readable JSON evidence.

## Correctness model

Agent exit status, verifier correctness, scope compliance, safety invariants, and multi-turn recovery are separate dimensions. A successful agent process is not a correctness claim.

## Evidence

Each result contains per-turn execution, scope evidence, verifier results, correctness fields, safety fields, and a score. Critical scope/safety failures keep the overall fixture failed regardless of aggregate score.

## Trust model

Verifier source is outside the agent workspace. The evaluator is not a privilege sandbox: an unrestricted agent shell may still discover sibling temporary paths. The correctness boundary therefore relies on independent execution and write-scope separation rather than secrecy alone.
