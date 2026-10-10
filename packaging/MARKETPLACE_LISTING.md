# Agensi Marketplace Listing — React + TypeScript Agent Skills Bundle

> This is the source-of-truth copy for the Agensi product listing. Keep it
> in sync with the live Agensi listing and with `CHANGELOG.md`. The bundle
> builder (`scripts/build-bundle.mjs`) reads the inventory numbers from
> `skill-manifest.yml`, `patterns/PATTERN_MANIFEST.yml`, and
> `benchmarks/manifest.yml`; the numbers below must match the builder's
> output or the listing is stale.

## Title

React + TypeScript Agent Skills — Complete Engineering Pack for AI Coding Agents

## Short description (≤ 160 chars)

Production-grade React + TypeScript engineering skills for AI coding agents: 127 skills, 60 patterns, 110 evaluation contracts, 102 benchmark cases.

## Long description

A curated, tested, and continuously validated skill library that turns
React + TypeScript engineering knowledge into executable guidance an AI
coding agent can use end-to-end: inspect a repository, route to the right
expertise, implement a bounded change, verify behavior, and report
evidence.

This is the **complete pack** — every skill, pattern, evaluation, and
benchmark that ships in the canonical open-source repository, packaged as
a single Agent Skills bundle that preserves the directory layout, the
skill-local `references/` and `scripts/`, and the contract tests that
guard them.

### What is included

| Asset | Count | Notes |
| --- | --- | --- |
| Skills (`skills/<name>/SKILL.md`) | 127 | Each with activation, inspection, decision, implementation, anti-patterns, review, and verification sections. |
| Reusable patterns (`patterns/<group>/<name>.md`) | 60 | Cross-cutting engineering patterns cited by skills and evals. |
| Evaluation contracts (`evaluations/react-typescript/*.yml`) | 110 | Prompt + checks per skill; used by `scripts/fixture-evaluator.mjs`. |
| Benchmark cases (`benchmarks/manifest.yml`) | 102 | Includes 8 fixture-backed executable scenarios. |
| Contract tests (`test/*.test.mjs`) | 14 | Structural, manifest, discovery, installer, efficiency, and platform-adapter contracts. |
| Validators (`scripts/validate*.mjs`) | 6 | Manifest, benchmarks, fixtures, discovery, plus the bundle builder. |
| Installer (`bin/install`) | 1 | Single-command install to any path. |

### Supported workflows

- **Architecture & boundaries** — feature architecture, module boundaries, dependency direction.
- **Component engineering** — component API design, composition, controlled inputs, accessibility.
- **Hooks, effects, state** — effect synchronization, reducer state machines, server-state boundaries.
- **Data fetching & caching** — TanStack Query, SWR, RTK Query, Apollo, urql, GraphQL Codegen.
- **Forms & validation** — React Hook Form, TanStack Form, Zod, Valibot, Yup, ArkType.
- **Routing & navigation** — React Router, Remix, TanStack Start, Next.js routing.
- **Server components & actions** — RSC boundaries, server actions, hydration stability.
- **Styling & layout** — Tailwind, CSS Modules, Emotion, Styled Components, Vanilla Extract.
- **Performance** — render budgets, memoization evidence gates, code splitting, virtualization.
- **Security** — DOM safety, auth/session boundaries, supply-chain, token storage, sanitization.
- **Testing** — Vitest, Vitest Browser, Testing Library, Playwright, Cypress, MSW.
- **Toolchain** — Vite, Rspack, Rsbuild, Next.js, Astro, biome, ESLint, Prettier, TypeScript config.
- **Production & observability** — Sentry, Datadog, New Relic, OpenTelemetry, service workers, PWA.
- **Deployment adapters** — Vercel, Netlify, Cloudflare, AWS, GitHub Pages, Docker/K8s.
- **Agent evaluation** — multi-turn scoring, adversarial evaluations, behavior scoring, discovery benchmarks.

### Installation

```bash
# Extract the bundle and run the installer
tar -xzf react-agent-skills-bundle-<version>.tgz -C ~/.local/share/agent-skills
bash ~/.local/share/agent-skills/react-agent-skills/bin/install --target ~/.local/share/agent-skills/react-agent-skills

# Verify
node ~/.local/share/agent-skills/react-agent-skills/scripts/validate.mjs
```

For custom agents (Codex, Cursor, etc.), see `docs/AGENT_INTEGRATION.md`
inside the bundle.

### Compatibility

- **Agent Skills format**: every skill ships as `SKILL.md` with `name` and
  `description` frontmatter, and progressive-disclosure `references/` and
  `scripts/` subdirectories one level deep.
- **Native discovery**: skills are discoverable from frontmatter alone; the
  `skill-manifest.yml` and `router/` are compatibility layers, not
  required model context.
- **Node.js ≥ 22** for the validators and contract tests.
- **No runtime dependencies**: the bundle is plain Markdown, YAML, and
  ESM JavaScript — no `package.json`, no install step beyond extraction.

### What the paid bundle adds over the free GitHub copy

The canonical source is and remains the public GitHub repository under
the MIT License. MIT permits redistribution and commercial resale, so
buyers of this bundle are paying for the following added value, not for
exclusivity:

1. **Curation** — a tested, versioned snapshot with all internal
   manifests, registries, and contract tests aligned.
2. **Packaging** — a single archive with the full directory tree,
   `references/`, `scripts/`, and `bin/install` preserved.
3. **Validation** — bundle contract tests guarantee the archive is
   internally consistent before publication.
4. **Starter bundle** — a free, smaller bundle is published alongside
   this paid bundle for evaluation; it is a strict subset of this
   archive.
5. **Maintenance** — release notes and CHANGELOG entry per published
   version.

See `packaging/LICENSE_ADDENDUM.md` for the precise licensing terms.

## Tags

react, typescript, ai-agents, coding-agent, agent-skills, claude-code, cursor, codex, frontend, rsc, vite, nextjs, testing, accessibility, performance, security

## Pricing guidance

- **Starter bundle**: free.
- **Complete bundle**: see Agensi listing. The price should reflect the
  curation, packaging, validation, and maintenance cost — not exclusivity.

## Support

- **Source of truth**: <https://github.com/shubhamtaywade82/react-agent-skills>
- **Issues**: GitHub Issues (preferred).
- **Agensi buyer support**: per Agensi's current terms.

## License

MIT License, Copyright (c) 2026 Shubham Taywade, with the marketplace
distribution addendum in `packaging/LICENSE_ADDENDUM.md`.
