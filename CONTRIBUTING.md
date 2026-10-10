# Contributing

Every skill must:
- live at `skills/<skill-name>/SKILL.md`;
- have `name` and `description` frontmatter;
- define activation, repository inspection, decision rules, implementation procedure, anti-patterns, review checklist, and verification;
- use source-foundation links to primary documentation;
- be registered in `skill-manifest.yml`.

Run:

    node scripts/validate.mjs

Keep guidance evidence-based and bounded to the skill's engineering concern.

## Marketplace bundle changes

When adding, renaming, or removing a skill, also update:

- `skill-manifest.yml` (canonical registry, read by `scripts/validate.mjs` and the bundle builders);
- `packaging/STARTER_SKILLS.yml` if the skill should ship in the free starter bundle;
- `evaluations/manifest.yml` if the skill ships an evaluation contract;
- `benchmarks/manifest.yml` if the skill ships a benchmark case.

The bundle contract test (`test/bundle-contract.test.mjs`) catches drift between the registries and the bundle staging tree, but it does not auto-fix. When it fails, fix the source of truth, not the test.

Before bumping the marketplace bundle version, run the full validator suite and the bundle contract test:

    node scripts/validate.mjs
    node scripts/validate-benchmarks.mjs
    node scripts/validate-fixtures.mjs
    node scripts/skill-discovery-evaluator.mjs --check
    node --test test/*.test.mjs
    node scripts/build-bundle.mjs --output dist/
    node scripts/build-starter-bundle.mjs --output dist/

CI runs all of the above on every push and pull request.
