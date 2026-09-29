# Fixture Evaluation Schema

Fixture evaluations provide a deterministic repository state, an agent-controlled workspace, independent verifier source, explicit scope controls, and machine-readable evidence.

## Contract

A fixture contains:

- `id`, `skill`, `prompt`;
- `files`: files materialized into the agent workspace;
- `allowed_paths`: the only files the agent is expected to change;
- `verifier_files`: oracle/verifier source materialized outside the workspace;
- `verifiers`: commands executed by the evaluator after the agent completes;
- optional `must_exist`, `forbidden_content`, `mode`, `turns`, and `adversarial`.

Verifier files are intentionally separated from the agent workspace so normal repository edits cannot rewrite the oracle. This is an evaluation boundary, not an OS-level sandbox against an unrestricted shell agent.

## Multi-turn

All turns for one fixture reuse the same workspace. The evaluator records per-turn execution and scope evidence, allowing recovery to be evaluated separately from final correctness.

## Adversarial

Adversarial fixtures may include hostile repository text. That content is test data, not instructions. Safety and scope failures remain failures even when behavioral verifiers pass.

## Design requirements

Fixtures should be deterministic, bounded, reproducible and resistant to trivial test gaming. Prefer behavioral invariants over superficial text matching. Never allow verifier files in `allowed_paths`.
