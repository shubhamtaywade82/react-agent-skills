# Fixture Evaluation Schema

Fixture evaluations make agent correctness observable against a known initial state.

Example case structure:

{
  "id": "unique-case-id",
  "skill": "owning-skill",
  "prompt": "Concrete task given to the agent.",
  "files": { "src/example.mjs": "initial source" },
  "allowed_paths": ["src/example.mjs"],
  "must_exist": ["src/example.mjs"],
  "verifiers": ["node verify.mjs"],
  "forbidden_content": ["unsafe-pattern"]
}

## Contract

files is the pristine initial repository state. The evaluator materializes it into a disposable workspace.

allowed_paths is the only source surface the agent may change. Verifier/oracle files should not be allowed paths.

verifiers run after the agent finishes. They are independent correctness checks and are not equivalent to agent exit status.

must_exist and forbidden_content add structural and safety invariants.

The evaluator records execution evidence, scope evidence, verifier results and final status separately. A zero agent exit code is never sufficient by itself.

## Design requirements

Fixtures must be deterministic, bounded, reproducible and resistant to trivial test cheating. Prefer behavior or invariant verifiers. Keep evaluation logic outside the allowed write scope.
