# Marketplace Distribution License Addendum

> This document is an addendum to the project's MIT License (`/LICENSE`).
> It clarifies what buyers of the Agensi marketplace bundle receive, what
> they do not receive, and how the open-source license and the paid
> marketplace distribution coexist.

## 1. Underlying license

The canonical source for this skill pack is the public GitHub repository
at <https://github.com/shubhamtaywade82/react-agent-skills>, licensed
under the MIT License, Copyright (c) 2026 Shubham Taywade.

MIT explicitly permits commercial reuse, resale, and redistribution,
provided the copyright and license notice are retained. **Nothing in
this addendum restricts the rights MIT already grants to anyone who
obtains the source from GitHub.**

## 2. What the Agensi paid bundle sells

The paid bundle is a convenience distribution of the same MIT-licensed
material. Buyers pay for the following added value, **not** for
exclusivity:

1. **Curation** — a single versioned snapshot whose `skill-manifest.yml`,
   `patterns/PATTERN_MANIFEST.yml`, `evaluations/manifest.yml`, and
   `benchmarks/manifest.yml` are mutually consistent and pass the full
   CI validator suite.
2. **Packaging** — a single archive that preserves the directory layout
   (`skills/`, `patterns/`, `evaluations/`, `benchmarks/`, `router/`,
   `docs/`, `bin/install`) instead of unrelated per-skill archives.
3. **Validation** — the bundle contract test (`test/bundle-contract.test.mjs`)
   and the bundle builder (`scripts/build-bundle.mjs`) verify the
   archive's internal consistency before it is uploaded.
4. **Maintenance** — release notes in `CHANGELOG.md` per published
   bundle version, plus a documented upgrade path between bundle
   versions.
5. **Discoverability** — listing on the Agensi marketplace, where
   buyers can search for, evaluate, and install curated agent skills.

## 3. What buyers receive

A personal, non-transferable license under Agensi's current terms to use
the bundle as distributed by Agensi, **plus** all rights MIT already
grants to anyone who obtains the same material from GitHub.

In particular, buyers may:

- install the bundle into any number of agent hosts they personally
  operate;
- read, study, and adapt the SKILL.md files, references, and scripts;
- run the contract tests, benchmark runner, and fixture evaluator;
- fork the bundle into a private repository for their own use, as long
  as the MIT copyright and license notice are retained.

## 4. What buyers do not receive

- **Exclusivity** — the same material is available, under MIT, from
  the canonical GitHub repository.
- **Redistribution rights beyond MIT** — reselling, re-packaging, or
  re-listing the bundle on another marketplace is governed by MIT and
  by Agensi's current terms, not by this addendum.
- **Warranty** — the material is provided "AS IS" without warranty of
  any kind, per the MIT License.
- **Backend skills** — Rails and Node backend skills live in
  `ruby-agent-skills` and `node-agent-skills` respectively and are not
  part of this bundle.

## 5. Agensi distribution license

Per Agensi's current creator terms (as of this writing): creators
retain ownership of their work and grant Agensi a non-exclusive
distribution license. Buyers receive a personal, non-transferable
license under Agensi's terms. This addendum does not override Agensi's
terms; it clarifies how those terms interact with the underlying MIT
license.

Before each publication, re-check Agensi's current creator terms at
<https://www.agensi.io/learn/how-to-sell-skills-on-agensi> and ensure
this addendum still matches. If Agensi's terms change in a way that
would restrict MIT-granted rights, pause publication and update this
addendum before re-uploading.

## 6. Free starter bundle

A free starter bundle is published alongside the paid bundle on Agensi.
The starter bundle is a strict subset of the paid bundle (see
`packaging/STARTER_SKILLS.yml`) and is also MIT-licensed. The starter
bundle's purpose is discovery and evaluation; it is not a substitute
for the complete bundle and does not include evaluation contracts,
benchmark cases, or contract tests.

## 7. How to verify a bundle

Buyers can verify that a downloaded bundle matches the canonical
GitHub source by running:

```bash
node scripts/validate.mjs
node scripts/validate-benchmarks.mjs
node scripts/validate-fixtures.mjs
node scripts/skill-discovery-evaluator.mjs --check
node --test test/*.test.mjs
```

All of the above must exit `0`. The bundle's `CHANGELOG.md` entry for
the published version pins the canonical source commit it was built
from.
