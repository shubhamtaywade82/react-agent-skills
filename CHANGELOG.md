# Changelog

## Unreleased

- Added Agensi marketplace packaging: `scripts/build-bundle.mjs` produces the complete bundle archive, `scripts/build-starter-bundle.mjs` produces the free starter bundle, both preserving the canonical directory layout (skills/, patterns/, evaluations/, benchmarks/, router/, docs/, bin/install, AGENTS.md, skill-manifest.yml, LICENSE, packaging/) so buyers get the same shape as the open-source repo.
- Added `packaging/` directory with the marketplace listing copy (`MARKETPLACE_LISTING.md`), the MIT + Agensi license addendum (`LICENSE_ADDENDUM.md`), the publishing workflow (`PUBLISHING.md`), the curated starter skills list (`STARTER_SKILLS.yml`), and the single-source bundle version (`BUNDLE_VERSION.txt`).
- Added `scripts/lib/bundle-shared.mjs` so the two builders and the bundle contract test share one definition of "registered skill/pattern/evaluation/benchmark".
- Added `test/bundle-contract.test.mjs` enforcing that the complete bundle ships every registered skill, pattern, evaluation, and benchmark, that the starter bundle is a strict subset of the complete bundle, and that both bundles are byte-identical to the canonical source.
- CI now builds both bundles on every push and pull request and uploads them as an `agensi-bundles` artifact alongside the existing `skill-discovery-report`.
- Linked node-agent-skills as a backend companion pack alongside ruby-agent-skills: `docs/FULLSTACK_COMPOSITION.md` covers both backends (install, per-concern ownership, name collisions), `router/ROUTING.md` gains a "Backend companion packs" table, and `frontend-repository-archetypes`, `AGENTS.md`, and `README.md` point at `rails-react-integration` and `node-react-integration`.
- Fixed escaped backticks that broke Markdown rendering in five documents.
- Bootstrapped the React + TypeScript agent skill pack.
- Added routing and governance foundations.
