# TODO

## Current work — production readiness pass

- [x] AGENTS.md raised to the full engineering-contract standard (13 sections added: domain change contracts, context rules, routing quality, design rules, security rules retained, verification contract, skill precedence, skill-pack installation, benchmark integrity, CI toolchain maintenance, release readiness, repository completeness; companion-pack seams made explicit).
- [x] Integration seam skills added: `react-rails-integration` (client side of Rails↔React) and `react-node-integration` (client side of Node↔React), symmetric with `rails-react-integration` and `node-react-integration`. The seam gap documented in the cross-pack review is closed.
- [x] `skill-manifest.yml` gains the `cross_pack:` v3 section: companions (ruby-agent-skills pinned v1.5.0, node-agent-skills), empty name-collision registry, and the two symmetric seam contracts.
- [x] `router/ROUTING.md` "Backend companion packs" table now routes through the seam skills instead of a generic secondary list.
- [x] `CLAUDE.md` added (Claude Code entry point), `RELEASE.md` added, `package.json` added (engines Node >=22, standard scripts), `framework-drift.yml` added (React 19 removals + TSLint deprecation), `TODO.md` added.

## Cross-pack follow-ups

- ruby-agent-skills: once its own CI can verify the change, update `cross_pack.seam_contracts` for the `rails-to-react-client` boundary so `companion_side` points at `react-agent-skills/skills/react-rails-integration` (currently the pre-existing `browser-authentication` stand-in) and refresh the React column in `router/ROUTING.md`. Make the change from the ruby side, where its system tests run — do not edit ruby files without running them.
- Pin `node-agent-skills` in `cross_pack.companions` to an immutable tag once it cuts its next release (currently `main`, matching how the companions pin this pack today).
- Create `data/cross-pack/` companion snapshots (like ruby and node ship) so a future cross-pack verifier can validate pinned refs offline.
- Adopt a `bin/cross-pack-verify` equivalent once this pack ships one, and run it with `--companions` in CI.

## Structural alignment (tracked from the cross-pack review)

- `evaluations/` vs `evals/`: ruby-agent-skills and node-agent-skills use `evals/`; this pack uses `evaluations/`. Renaming touches the manifest registry, test pins, and bundle layout — schedule as its own change, then document the aligned name.
- `adapters/`, `agent-recordings/`, `mcp/`: not yet present. Create `mcp/` server definitions before exposing this pack over MCP; add `agent-recordings/` before recording regression campaigns.
- Naming conventions: skills mix `agent-*`, `frontend-*`, `react-*`, `typescript-*`, and bare library names (`nextjs`, `vite`, ...). Bare library names are acceptable for adapter-style skills; document the convention in `AGENTS.md` before adding more.

## Skill ownership vs companion packs

ruby-agent-skills still ships deprecated react-* skills (`react-architecture`, `react-component-engineering`, `react-data-fetching`, `react-testing-engineering`, ...) that collide with this pack's identically named skills; its collision registry already marks them `companion_wins`. No action here — installs must keep this pack after ruby-agent-skills (see `docs/FULLSTACK_COMPOSITION.md`).

## Skill depth

Most `SKILL.md` files are ~2 KB scaffolds. Enrich toward the ruby-agent-skills baseline (~4–5 KB with code examples, decision trees, and source citations), starting with the highest-traffic routing targets. Keep each skill under 500 lines; move deep knowledge into skill-local `references/` one level deep (the efficiency contract already tracks reference coverage).

## Scheduled recheck

- After node-agent-skills merges its production-readiness branch, confirm its `cross_pack.seam_contracts.companion_side` still points at `react-node-integration`, and that both manifests agree on the seam skill paths.
