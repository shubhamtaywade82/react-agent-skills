# Fixture Evaluation Schema

Fixture evaluations make AI-agent frontend correctness observable against a known initial state.

## Case fields

A case contains:
- `id`: stable identifier.
- `skill`: owning skill.
- `prompt`: initial task.
- `files`: pristine initial source/config files.
- `allowed_paths`: only files the agent may change.
- `must_exist`: required final artifacts.
- `verifiers`: independent commands executed after the agent.
- `forbidden_content`: safety/content patterns that must not remain.
- `mode`: `single_turn`, `multi_turn`, or `adversarial`.
- `turns`: ordered prompts for a persistent multi-turn scenario.
- `adversarial`: explicit marker for hostile-content/security probes.

## Contract

The evaluator materializes `files` into a disposable workspace. Verifier/oracle files must not be included in `allowed_paths`.

For multi-turn cases, all turns share the same workspace and prior evidence. For adversarial cases, repository content may contain hostile or misleading instructions; it remains untrusted data.

## Correctness model

Agent process success, verifier correctness, scope compliance and safety compliance are separate dimensions.

A zero exit code never implies correctness. A failed safety invariant remains a hard evaluation failure even when functional verifiers pass.

## Design requirements

Fixtures must be deterministic, bounded, reproducible, resistant to trivial test cheating and independent of the implementation's internal structure where practical.
