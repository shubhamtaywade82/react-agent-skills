# Skill Discovery Evaluation

This benchmark is a deterministic routing regression, not a simulation of a specific model's internal selection algorithm. Native Agent Skills hosts discover skills from `SKILL.md` name/description metadata and load full instructions only after activation; this evaluator therefore does not read `skill-manifest.yml` triggers. citeturn183590search1turn183590search2

## What it checks

- 127 native skill descriptions are catalogued.
- Curated intent queries route the intended skill into the top three lexical candidates.
- The intended skill beats declared high-risk competitors by a positive margin.
- Approximate discovery-catalog token cost is reported.

## What it does not claim

Lexical scoring is only a regression signal. It is not evidence that every model/client will select the same skill. Real trigger-rate evaluation should use model execution traces and positive/near-miss prompts, following the Agent Skills authoring guidance. citeturn183590search0turn183590search5

## Run

    node scripts/skill-discovery-evaluator.mjs --check

Without `--check`, the command emits the same JSON report but does not fail the process for routing regressions.

## Maintenance

When a high-signal description changes, update or add a representative case, especially where a generic domain skill competes with a vendor adapter. Do not tune descriptions only for benchmark prompts; validate against real agent traces as well.
