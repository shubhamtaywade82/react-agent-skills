# Routing Guide

## Native Agent Skills mode

When the host supports the Agent Skills standard, skill `name` and `description` metadata are the primary discovery surface. Do not make the model load `skill-manifest.yml` merely to discover skills.

For the repository's local router, use `ROUTING_POLICY.yml` plus the tables below. Pick one primary skill, add only evidence-backed secondary skills, and load adapter skills only after package/config/source inspection confirms the technology.

## Selection order

1. Identify the user's intent and dominant engineering boundary.
2. Inspect the repository for framework/runtime/tool evidence.
3. Pick the single best primary skill.
4. Add only the secondary constraints that materially change the implementation.
5. Read skill-local references just before the decision they support.
6. Prefer deterministic skill-local scripts for repeatable validation.

## Anti-collision rule

Generic words such as `test`, `fetch`, `form`, `state`, `storage`, `mutation`, `retry`, `schema`, `build`, `action`, `streaming`, and `deployment` are not sufficient ownership signals. Use domain-qualified or tool-qualified triggers instead.
