# Skill Loading Strategy

Use this reference when deciding what context to load for a repository task.

## Loading model

1. Native Agent Skills clients discover `name` and `description` first.
2. Activate the smallest skill that owns the dominant engineering boundary.
3. Load a secondary skill only when repository evidence creates a real additional constraint.
4. Read a reference file only when its condition matches the task.
5. Run bundled scripts only when they replace repeated manual work or provide deterministic validation.

Do not preload every skill, every reference, or every adapter.

## Selection defaults

- Unknown repository: inspect first; use `frontend-repository-archetypes` as the primary skill.
- Local feature: prefer the feature's owning domain skill.
- Framework/library-specific behavior: activate the generic domain skill first, then the evidence-matched adapter.
- Cross-cutting security/accessibility/testing: add only the constraint that materially affects the change.
- Limit secondary skills to the smallest coherent set; remove a secondary skill when its instructions do not affect the implementation.

## Reference loading

Reference paths must be relative to the current skill root and one level deep. Load them just before the decision they inform. Do not create chains where one reference requires another reference.

Example:

`Read references/api-selection.md before choosing a React 19 API.`

## Anti-patterns

- Loading all 127 skills because the task is broad.
- Treating trigger keywords as ownership without inspecting the repository.
- Presenting framework adapters as equal choices instead of evidence-gated alternatives.
- Repeating generic React/TypeScript knowledge that the model already knows.
