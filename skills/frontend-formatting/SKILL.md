---
name: frontend-formatting
description: Detect and enforce the repository's formatting contract without mixing formatter policy into semantic lint rules.
license: MIT
---

# Frontend Formatting

## Purpose

Keep the repository's formatting contract mechanical and boring: one authoritative formatter, deterministic output, zero semantic churn. Formatting exists so that diffs contain only behavior — when formatting drifts, every review becomes a whitespace negotiation and `git blame` points at reformat commits.

## Activate when

Activate when formatting differs across files, CI detects format drift, or the repository evaluates Prettier/Biome/editor formatting behavior.

## Boundary with related skills

- Use `frontend-formatting` for the formatter contract (Prettier/Biome policy, CI check).
- Use `prettier` / `biome` when configuring a specific formatter tool.
- Use `frontend-generated-code` for excluding generated files from both format and lint.
- Semantic rules (correctness, a11y, import boundaries) belong to lint config, not the formatter.

## Repository inspection

Inspect package scripts, formatter configs (`.prettierrc*`, `biome.json`), editor settings (`.editorconfig`), generated-file rules, workspace config and existing formatting conventions. Establish which formatter is authoritative before proposing changes — introducing a second formatter to a repo with one is the primary failure mode.

## Decision rules

Use one authoritative formatter contract per file class. Prefer an existing repository formatter before adding one. Treat Prettier and Biome as conditional adapters unless repository evidence confirms them.

Formatting should not silently rewrite generated files or unrelated packages.

- CI checks, humans fix: `--check` in CI and `--write` locally via a fixed script; never "format in CI".
- Config is discovered once (root config), not per-directory overrides — discovery ambiguity is drift.
- Editor formatting follows the shared config (`.editorconfig` aligned with the formatter); per-developer editor settings are not a contract.
- A formatting change is its own commit, never mixed with behavior — reviewability and `git blame` depend on the separation.

## Implementation contract

Define file ownership, config discovery, generated-file exclusions and the CI command. Keep formatting deterministic and independent of editor-specific settings.

**Reference example** — a complete formatting contract:

```jsonc
// package.json — two scripts, one source of truth
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

```jsonc
// .prettierrc.json — pinned, no per-directory overrides
{
  "semi": true,
  "singleQuote": false,
  "printWidth": 100,
  "trailingComma": "all"
}
```

```
# .prettierignore — generated and vendored trees stay out
src/generated/
coverage/
dist/
**/package-lock.json
```

```yaml
# .github/workflows/validate.yml — drift fails the build
- run: npm ci
- run: npm run format:check
```

Migrating a formatter or settings? The one-time mass reformat is a single dedicated commit:

```bash
git checkout -b chore/format-rebaseline
npm run format
git add -A && git commit -m "chore: reformat to pinned Prettier config (no semantic changes)"
# behavior changes land in separate commits before/after
```

## Failure handling

Check line endings, config discovery, ignored/generated files and multiple formatter conflicts before accepting mass reformatting.

- Line-ending churn (CRLF↔LF) across platforms: pin `.gitattributes` (`* text=auto eol=lf`) before the reformat, or every Windows checkout re-dirties the tree.
- Config discovery failure: a nested config or missing ignore file silently includes `node_modules`/generated paths.
- Multiple formatter conflicts: Biome and Prettier both active (via editor plugins) fight over the same files — remove one.
- A generated file reformatted by accident: the next generation step reverts it, creating an infinite dirty tree.

## Review

Review diff size and semantic churn. Formatting changes should not obscure behavior changes. A pure formatting PR should show only whitespace/config diffs — if any line change is semantic, the PR is mislabeled.

## Verification

Run the formatter check and inspect the final diff for unrelated changes. Concretely: (a) `npm run format:check` passes in CI; (b) the reformat commit's diff survives `git diff --ignore-all-space` as empty (or near-empty) — proving whitespace-only; (c) re-running the formatter twice is a no-op (determinism); (d) generated files unchanged after regeneration.
