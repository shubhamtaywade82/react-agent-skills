# Agensi Marketplace Publishing Workflow

> This document describes how to publish (and re-publish) the React +
> TypeScript Agent Skills bundle to the Agensi marketplace. It is the
> step-by-step companion to `packaging/MARKETPLACE_LISTING.md` and
> `packaging/LICENSE_ADDENDUM.md`.

## Pre-publication gates

All of the following must pass before any bundle is uploaded to Agensi.

```bash
# 1. Structural + manifest + discovery validators
node scripts/validate.mjs
node scripts/validate-benchmarks.mjs
node scripts/validate-fixtures.mjs
node scripts/skill-discovery-evaluator.mjs --check

# 2. Contract tests (includes the bundle-contract test)
node --test test/*.test.mjs

# 3. Build the bundles and validate them
node scripts/build-bundle.mjs       --output dist/
node scripts/build-starter-bundle.mjs --output dist/

# 4. Installer smoke
bash bin/install --target /tmp/react-agent-skills-install
```

The CI workflow (`.github/workflows/validate.yml`) runs steps 1–3 on
every push and pull request. A red CI is a hard stop: do not publish.

## Build the bundles

```bash
# Complete bundle (paid)
node scripts/build-bundle.mjs --output dist/

# Starter bundle (free)
node scripts/build-starter-bundle.mjs --output dist/
```

Each builder produces a `.tgz` archive in `--output` plus a
`<bundle-name>.manifest.json` describing the contents. The manifest is
what the bundle contract test reads, so it must be present and valid.

### What the builders do

1. Read the canonical registries (`skill-manifest.yml`,
   `patterns/PATTERN_MANIFEST.yml`, `evaluations/manifest.yml`,
   `benchmarks/manifest.yml`).
2. Copy the registered skills, patterns, evaluations, and benchmarks
   into a staging directory.
3. Copy `AGENTS.md`, `bin/install`, `router/`, `docs/`, `LICENSE`,
   `packaging/LICENSE_ADDENDUM.md`, `packaging/MARKETPLACE_LISTING.md`,
   and `scripts/validate*.mjs` so buyers can re-validate locally.
4. Write a `BUNDLE_MANIFEST.json` at the archive root with: bundle
   name, version, source commit (`git rev-parse HEAD`), build timestamp,
   skill count, pattern count, evaluation count, benchmark count.
5. Tar+gzip the staging directory.

### What the builders do **not** do

- They do **not** modify any `SKILL.md`, `references/`, or `scripts/`
  file. The bundle is byte-identical to the canonical source.
- They do **not** include `.git/`, `node_modules/`, or local
  `dist/` outputs.
- They do **not** fetch any remote assets. The bundle is self-contained.

## Upload to Agensi

1. Sign in to <https://www.agensi.io>.
2. Open the creator dashboard and create (or update) a listing using
   the copy in `packaging/MARKETPLACE_LISTING.md`.
3. Upload the complete bundle `.tgz` to the listing.
4. Upload the starter bundle `.tgz` to a separate, free listing.
5. Set the license to "MIT + Marketplace Addendum" and link to
   `packaging/LICENSE_ADDENDUM.md` from the listing body.
6. Submit for review.

## Post-publication

1. Tag the source commit on GitHub: `git tag bundle-<version>` and
   `git push --tags`.
2. Append a `CHANGELOG.md` entry under "Unreleased" (or a new version
   heading) listing the bundle version, the source commit, and any
   listing changes.
3. If Agensi's creator terms have changed since the last publication,
   update `packaging/LICENSE_ADDENDUM.md` first and re-run the gates
   before re-uploading.

## Re-publishing on a new version

When the canonical GitHub repository ships a new release:

1. Pull `main` and confirm CI is green locally.
2. Bump `BUNDLE_VERSION` in `scripts/build-bundle.mjs` and
   `scripts/build-starter-bundle.mjs` (or read it from a single
   `packaging/BUNDLE_VERSION.txt`).
3. Re-run the pre-publication gates.
4. Re-build both bundles.
5. Upload the new `.tgz` files to the same Agensi listings, replacing
   the previous versions.
6. Tag the source commit and update `CHANGELOG.md`.

## What not to do

- Do not publish a bundle whose CI is red.
- Do not publish a bundle whose `BUNDLE_MANIFEST.json` source commit
  does not match `git rev-parse HEAD`.
- Do not publish a bundle whose contents differ from the GitHub
  `main` branch at the pinned commit.
- Do not upload individual `SKILL.md` files as separate archives; the
  value of the bundle is the curated, internally-validated directory
  tree.
- Do not change the listing copy without updating
  `packaging/MARKETPLACE_LISTING.md` to match.
- Do not change the license terms without updating
  `packaging/LICENSE_ADDENDUM.md` to match.
