# Changelog

## Unreleased

### Enrichment band 4: the 3x eval-corpus tier

- Enriched to production depth: `typescript-runtime-contracts` (env + storage boundaries with schema-derived types), `react-component-engineering` (discriminated dialog-variant example, composition over configuration), `react-hooks-effects` (subscription hook + AbortController race fix), `react-state-management` (reducer-owned invariants, split context, URL-owned state), `typescript-module-design` (exports-map surface, cycle detection and the extract-downward fix), `typescript-migration` (ratchet config, unknown-at-boundary slice conversion, measured trend), `frontend-styling-layout` (intrinsic grid, interaction states, reduced motion, z-index policy), `frontend-dependency-management` (decision ladder, Intl-over-dependency example, lockfile discipline), `frontend-production` (immutable assets vs runtime config, cache matrix, version health endpoint, rollback rehearsal), `frontend-security` (SRI-pinned third-party scripts, centralized CSRF carriage, headers as code), `react-routing` (validated params, allowlisted returnTo, URL as single owner), `react-error-resilience` (failure taxonomy, bounded idempotency-aware retry, boundary scoping).
- Scaffold descriptions preserved verbatim — the discovery benchmark stays 59/59 without tuning.

## Old


### Enrichment band 3: the 4x eval-corpus tier

- Enriched to production depth: `typescript-api-contracts` (transport vs domain types, zod boundary validation, discriminated error envelope with retryable/terminal/permission classes, full endpoint example), `typescript-configuration` (strict base + app/node splits, bundler vs node18 resolution trap, emit-semantics flags, tsconfig composition example), `browser-security-dom-safety` (source→transform→sink mapping, URL/postMessage/HTML-choke-point contracts with adversarial examples), `auth-session-boundaries` (authN/authZ/presentation split, httpOnly-first credential policy, single-flight refresh with 401/403 split, complete logout checklist).
- Each skill carries purpose, boundary-with-related-skills, decision rules, a reference example, anti-patterns, verification steps, and a source foundation (OWASP cheat sheets, MDN, TypeScript docs, RFC 6265, OpenAPI/zod).

## Old


### Production readiness: naming conventions and TODO sync

- AGENTS.md gains a "Skill naming conventions" section: domain prefixes (`react-`, `frontend-`, `typescript-`, `browser-`, `agent-`) for domain skills, bare library names reserved for adapter-style skills, the `<client>-<backend>-integration` seam naming pattern, a pre-addition collision check, and the grandfathered unprefixed exceptions (`auth-session-boundaries`, `github-pages`).
- TODO.md synced with merged reality: the second enrichment band (PR #25) is recorded as complete, the node-agent-skills seam recheck is closed (cross-pack verification passes with both manifests agreeing on the seam skill paths), and the next eval-corpus-frequency enrichment band is identified (4x tier: `typescript-api-contracts`, `typescript-configuration`, `browser-security-dom-safety`, `auth-session-boundaries`).

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
