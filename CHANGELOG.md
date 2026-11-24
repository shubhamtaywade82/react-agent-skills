# Changelog

## Unreleased

### Production readiness: cross-pack seams and engineering contract

- Added the symmetric client-side integration seam skills: `react-rails-integration` (Rails↔React client contract: CSRF token handling, session credentials, 422 validation-error mapping, pagination consumption) and `react-node-integration` (Node/BFF↔React client contract: typed API consumption, problem-details mapping, credential modes, SSE/WebSocket lifecycle). Both mirror the server-side seams `rails-react-integration` and `node-react-integration`, closing the cross-pack seam gap flagged in the production-readiness review.
- `skill-manifest.yml` now declares the `cross_pack:` v3 section: companion packs (ruby-agent-skills pinned `v1.5.0`, node-agent-skills), the empty name-collision registry, and the two seam contracts with companion-side paths. `router/ROUTING.md` "Backend companion packs" routes through the new seam skills.
- AGENTS.md raised to the full engineering-contract standard: domain change contracts, context rules, routing quality, design rules, verification contract, skill precedence, skill-pack installation, benchmark integrity, CI toolchain maintenance, release readiness, and repository completeness sections added; the operating sequence and React/TypeScript/security/dependency/evaluation rules preserved.
- Added `CLAUDE.md` (Claude Code entry point and orientation), `RELEASE.md` (release gate and companion coordination), `package.json` (engines Node >=22, standard test/validate/bundle scripts), `framework-drift.yml` (React 19 removals and the TSLint deprecation that skill code fences must not recommend), and `TODO.md` (tracked production-readiness follow-ups).
- Added Agensi marketplace packaging: `scripts/build-bundle.mjs` produces the complete bundle archive, `scripts/build-starter-bundle.mjs` produces the free starter bundle, both preserving the canonical directory layout (skills/, patterns/, evaluations/, benchmarks/, router/, docs/, bin/install, AGENTS.md, skill-manifest.yml, LICENSE, packaging/) so buyers get the same shape as the open-source repo.
- Added `packaging/` directory with the marketplace listing copy (`MARKETPLACE_LISTING.md`), the MIT + Agensi license addendum (`LICENSE_ADDENDUM.md`), the publishing workflow (`PUBLISHING.md`), the curated starter skills list (`STARTER_SKILLS.yml`), and the single-source bundle version (`BUNDLE_VERSION.txt`).
- Added `scripts/lib/bundle-shared.mjs` so the two builders and the bundle contract test share one definition of "registered skill/pattern/evaluation/benchmark".
- Added `test/bundle-contract.test.mjs` enforcing that the complete bundle ships every registered skill, pattern, evaluation, and benchmark, that the starter bundle is a strict subset of the complete bundle, and that both bundles are byte-identical to the canonical source.
- CI now builds both bundles on every push and pull request and uploads them as an `agensi-bundles` artifact alongside the existing `skill-discovery-report`.
- Linked node-agent-skills as a backend companion pack alongside ruby-agent-skills: `docs/FULLSTACK_COMPOSITION.md` covers both backends (install, per-concern ownership, name collisions), `router/ROUTING.md` gains a "Backend companion packs" table, and `frontend-repository-archetypes`, `AGENTS.md`, and `README.md` point at `rails-react-integration` and `node-react-integration`.
- Fixed escaped backticks that broke Markdown rendering in five documents.
- Bootstrapped the React + TypeScript agent skill pack.
- Added routing and governance foundations.
