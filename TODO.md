# TODO

## Current work — production readiness pass

- [x] AGENTS.md raised to the full engineering-contract standard (13 sections added: domain change contracts, context rules, routing quality, design rules, security rules retained, verification contract, skill precedence, skill-pack installation, benchmark integrity, CI toolchain maintenance, release readiness, repository completeness; companion-pack seams made explicit).
- [x] Integration seam skills added: `react-rails-integration` (client side of Rails↔React) and `react-node-integration` (client side of Node↔React), symmetric with `rails-react-integration` and `node-react-integration`. The seam gap documented in the cross-pack review is closed.
- [x] `skill-manifest.yml` gains the `cross_pack:` v3 section: companions (ruby-agent-skills pinned v1.5.0, node-agent-skills), empty name-collision registry, and the two symmetric seam contracts.
- [x] `router/ROUTING.md` "Backend companion packs" table now routes through the seam skills instead of a generic secondary list.
- [x] `CLAUDE.md` added (Claude Code entry point), `RELEASE.md` added, `package.json` added (engines Node >=22, standard scripts), `framework-drift.yml` added (React 19 removals + TSLint deprecation), `TODO.md` added.

## Cross-pack follow-ups (RESOLVED 2026-11-24 — structural-alignment pass)

- [x] ruby-agent-skills seam: this pack's `react-rails-integration` is registered on the ruby side as the companion side of the `rails-to-react-client` boundary (executed from the ruby repository where its system tests run, tracked in its own PR); this pack's manifest already points at it symmetrically.
- [x] `node-agent-skills` pinned to the immutable tag **`v0.11.0`** (its first tagged release, cut by its Release workflow at the release merge commit `9d74c75`); the snapshot records the tagged commit.
- [x] `data/cross-pack/` companion snapshots created: `node-agent-skills.snapshot.yml` (subset list; zero collisions by the documented `node-` prefix contract) and `ruby-agent-skills.snapshot.yml` (full 104-skill inventory at the pinned v1.5.0 tag, so the collision registry is computed from the complete set).
- [x] `bin/cross-pack-verify.mjs` shipped (self-contained v3 verifier: companions, snapshot freshness, recomputed collision intersections, seam primaries on disk, optional `--companions` symmetry) and wired into CI after `npm run validate`. The verifier flagged a real registry defect, fixed in the same change: ruby-agent-skills ships 8 deprecated scaffolds whose names this pack owns (the 4 `react-*` skills plus `agent-workflow`, `typescript-core-engineering`, `typescript-runtime-contracts`, `typescript-type-design`) — `cross_pack.name_collisions` now documents all 8 as `this_pack_wins`, symmetric with ruby's `companion_wins` registry; the previously empty registry was wrong.

## Structural alignment (RESOLVED 2026-11-24)

- [x] `evaluations/` → `evals/` renamed for cross-pack consistency (ruby-agent-skills and node-agent-skills use `evals/`): 28 files updated (manifest, validators, bundle builders, tests, docs, packaging, bin/install, skill prose); skill names like `agent-adversarial-evaluations` are untouched; `CHANGELOG.md` history keeps the old name; the aligned name is documented in AGENTS.md ("Repository completeness changes").
- [x] `mcp/` server definitions created before any server ships: `mcp/README.md` + `mcp/permissions.yml` (schema_version 1 policy, fail-closed, pre-classifying the read-only routing surface; node-agent-skills' `lib/mcp-server.mjs` is the family's reference implementation).
- [x] `agent-recordings/` format contract added (`agent-recordings/README.md`), mirroring the family convention; no fabricated recordings.
- [x] CI hardened (mirrors node-agent-skills): per-ref concurrency with `cancel-in-progress` and a 30-minute job timeout.
- [x] Naming conventions: skills mix `agent-*`, `frontend-*`, `react-*`, `typescript-*`, `browser-*`, and bare library names (`nextjs`, `vite`, ...). Bare library names are acceptable for adapter-style skills; the convention is now documented in `AGENTS.md` ("Skill naming conventions") — follow it before adding more skills.

## Skill ownership vs companion packs

ruby-agent-skills still ships deprecated react-* skills (`react-architecture`, `react-component-engineering`, `react-data-fetching`, `react-testing-engineering`, ...) that collide with this pack's identically named skills; its collision registry already marks them `companion_wins`. No action here — installs must keep this pack after ruby-agent-skills (see `docs/FULLSTACK_COMPOSITION.md`).

## Skill depth

- [x] Highest-traffic routing targets enriched (production-readiness increment 2): `frontend-e2e` (4x eval-corpus), `react-architecture`, `frontend-architecture`, `react-async-ui`, `react-testing-engineering`, `react-accessibility`, `react-performance`, `frontend-networking` (3x each), `react-data-fetching`, `react-forms-validation` (2x each) — each now carries purpose, boundary-with-related-skills, decision frameworks, a complete reference example, agent checklists, and source foundations.
- [x] Second band enriched (production-readiness increment 3, PR #25): `frontend-browser-platform`, `frontend-formatting` (3x each), `react-modern-rendering`, `react-server-components`, `typescript-type-design`, `typescript-public-api-design`, `typescript-async-error-modeling` (2x each).
- [x] Third band enriched (production-readiness increment 4): `typescript-api-contracts`, `typescript-configuration`, `browser-security-dom-safety`, `auth-session-boundaries` (4x eval-corpus tier) — same depth baseline (purpose, boundaries, decision rules, reference example, anti-patterns, verification, source foundation).
- [x] Fourth band enriched (production-readiness increment 5): the 3x eval-corpus tier — `typescript-runtime-contracts`, `react-component-engineering`, `react-hooks-effects`, `react-state-management`, `typescript-module-design`, `typescript-migration`, `frontend-styling-layout`, `frontend-dependency-management`, `frontend-production`, `frontend-security`, `react-routing`, `react-error-resilience` — same depth baseline (descriptions kept verbatim; bodies gained purpose prose, boundaries, decision rules, reference examples, anti-patterns, review checklists, verification, source foundations).
- [x] All eval-corpus frequency tiers (4x/3x/2x) enriched across bands 1–4 — every skill the corpus exercised at 2× or above now carries the depth baseline.
- The remaining ~96 skills are ~1.5–2 KB scaffolds and have no corpus-frequency tiers left; choose the next band from a fresh eval-corpus frequency audit (extend the corpus first if needed) or by routing-case demand. Keep each skill under 500 lines; move deep knowledge into skill-local `references/` one level deep (the efficiency contract already tracks reference coverage).

## Scheduled recheck

- [x] node-agent-skills merged its production-readiness work (main `5f84831` → `8116329`): its `cross_pack.seam_contracts.companion_side` now points at `react-node-integration`, both manifests agree on the seam skill paths, and its `bin/cross-pack-verify.mjs --companions` run passes with this pack's seam skills resolving. Remaining follow-up is companion pinning (see "Cross-pack follow-ups").
