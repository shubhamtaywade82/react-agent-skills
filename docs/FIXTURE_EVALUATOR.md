# Fixture Evaluation Runner

Run:

    node scripts/fixture-evaluator.mjs --manifest benchmarks/fixtures/manifest.json --agent "<agent command>" --output artifacts/fixture-results.json

The evaluator materializes a clean fixture, writes PROMPT.md and CASE.json, snapshots the initial files, runs the agent, snapshots the result, checks changed paths, runs independent verifiers, checks required files and forbidden content, and emits machine-readable evidence.

## Correctness model

The result separates agent execution status, verifier pass rate, scope compliance, required-file compliance and safety-content compliance.

A successful process exit is not a correctness claim.

## Authoring rules

Keep verifier files outside allowed_paths. Do not allow the agent to rewrite its own oracle. Prefer deterministic checks over timing-sensitive checks.

The evaluator is provider-neutral. An agent adapter supplies the command; the fixture harness supplies the correctness boundary.
