# Agent Skills Optimization

This pack uses the Agent Skills progressive-disclosure model.

## Design goals

- Keep SKILL.md focused on information an agent needs immediately after activation.
- Use skill-local references/ for detailed, condition-specific material.
- Use skill-local scripts/ for deterministic repeatable checks.
- Prefer intent-focused descriptions over generic keyword lists.
- Select one primary skill and only evidence-backed secondary skills.
- Activate vendor/framework adapters only after repository evidence confirms the technology.

## Native versus local routing

Native Agent Skills hosts should discover skills from SKILL.md frontmatter. The repository manifest and router are compatibility/tooling layers for installations that need explicit indexing or deterministic local routing.

## Progressive disclosure rules

A reference must be:
- relative to the skill root;
- one level deep from SKILL.md;
- loaded only when its condition applies.

Do not create reference-to-reference chains.

## Routing rules

Generic nouns such as test, fetch, form, state, storage, mutation, schema, retry, build, or deployment are not ownership signals. Prefer domain-qualified or tool-qualified triggers and inspect the repository before selecting an adapter.

## Resource placement

Keep high-signal gotchas in SKILL.md when the agent needs them before recognizing the failure mode. Move detailed matrices, compatibility tables, migration gates and extended checklists into references/.

Use scripts only where a deterministic utility is clearly better than asking the agent to recreate the same procedure.

## Evaluation

Repository tests cover structural efficiency properties. Actual trigger-rate evaluation remains agent-client-specific and should use realistic positive/near-miss queries with fixed train/validation splits, as recommended by the Agent Skills authoring guidance.

## Sources

- https://agentskills.io/specification
- https://agentskills.io/skill-creation/best-practices
- https://agentskills.io/skill-creation/optimizing-descriptions
