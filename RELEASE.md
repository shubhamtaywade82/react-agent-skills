# Releasing react-agent-skills

This pack releases as a repository tag plus two Agensi marketplace bundles. The bundles must be byte-identical to the canonical source at the tagged commit; `test/bundle-contract.test.mjs` enforces this, and CI builds both bundles on every push.

## Release gate (all must pass)

1. `npm test` — the full contract suite (`node --test test/*.test.mjs`) is green.
2. `npm run validate` — the canonical validator passes.
3. `npm run validate:fixtures` and `npm run validate:benchmarks` — fixture and benchmark registries resolve.
4. `test/bundle-contract.test.mjs` — both bundles build and match the canonical registries (included in `npm test`).
5. `AGENTS.md`, `README.md`, `CHANGELOG.md`, `skill-manifest.yml`, and `router/ROUTING.md` agree on the skill inventory.
6. `cross_pack:` companions in `skill-manifest.yml` point at reachable companion refs; seam contracts are symmetric with the companion packs' manifests.
7. No credentials, local paths, generated bundle outputs, or provider-specific secrets are committed.

## Steps

1. Fold `CHANGELOG.md` `## Unreleased` into a new versioned section; leave `## Unreleased` empty.
2. If the skill inventory changed, confirm `test/skill-efficiency-contract.test.mjs` pin matches the on-disk inventory.
3. If marketplace bundles ship with this release, bump `packaging/BUNDLE_VERSION.txt` per semver: new skills or sections are `minor`; removals, renames, or contract breaks are `major`; fixes are `patch`.
4. Tag the release commit (`vX.Y.Z`) and push the tag.
5. Follow `packaging/PUBLISHING.md` to publish the Agensi bundles.
6. Record the release in `docs/PROMOTION_METADATA.md` if it is a promotion release.

## Companion-pack coordination

This pack's seams (`react-rails-integration`, `react-node-integration`) are verified against the companion packs' manifests. After a companion release (ruby-agent-skills, node-agent-skills):

1. Update the `pinned_ref` in `skill-manifest.yml` `cross_pack.companions` to the companion's new immutable tag.
2. Confirm each companion's `cross_pack.seam_contracts` still points at this pack's seam skills.
3. Note the resolved companion refs in the CHANGELOG entry.

Before this pack's own release, prefer pinning companions to immutable tags (not `main`).
