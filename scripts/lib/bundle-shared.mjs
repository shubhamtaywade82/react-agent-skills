// Shared helpers for the bundle builders.
//
// Both build-bundle.mjs and build-starter-bundle.mjs read the canonical
// registries (skill-manifest.yml, patterns/PATTERN_MANIFEST.yml,
// evaluations/manifest.yml, benchmarks/manifest.yml), copy the
// registered files into a staging directory, and tar+gzip the result.
//
// Keeping the parsing logic in one place ensures the two builders agree
// on what "registered" means and the bundle-contract test can reuse the
// same definitions.

import { readFile } from "node:fs/promises";
import { execSync } from "node:child_process";

// This module lives at scripts/lib/bundle-shared.mjs, so the repo root
// is two directories up. fileURLToPath is used by callers, but we keep
// REPO_ROOT as a URL so readRepoText can use new URL(rel, REPO_ROOT)
// without converting.
export const REPO_ROOT = new URL("../../", import.meta.url);

/** Read a file under the repo root as UTF-8 text. */
export async function readRepoText(rel) {
  return readFile(new URL(rel, REPO_ROOT), "utf8");
}

/**
 * Parse the skill-manifest.yml registry.
 *
 * The manifest uses the fixed-shape form:
 *
 *   - name: <skill-name>
 *     path: skills/<skill-name>/SKILL.md
 *     triggers: [...]
 *
 * We rely on the same line-by-line shape that scripts/validate.mjs
 * uses; if validate.mjs ever moves to a real YAML parser, this should
 * move with it.
 */
export async function readSkillRegistry() {
  const text = await readRepoText("skill-manifest.yml");
  const entries = [
    ...text.matchAll(
      /^  - name: ([A-Za-z0-9-]+)\n    path: (skills\/[A-Za-z0-9-]+\/SKILL\.md)$/gm,
    ),
  ].map(([, name, path]) => ({ name, path }));
  if (!entries.length) throw new Error("skill-manifest.yml has no skills registered");
  return entries;
}

/**
 * Parse patterns/PATTERN_MANIFEST.yml.
 *
 * Each entry looks like:
 *
 *   - name: <pattern-name>
 *       path: patterns/<group>/<file>.md
 *
 * The exact indentation differs from skill-manifest.yml, so we use the
 * same pattern scripts/validate.mjs uses.
 */
export async function readPatternRegistry() {
  const text = await readRepoText("patterns/PATTERN_MANIFEST.yml");
  const lines = text.split(/\r?\n/);
  const entries = [];
  for (let i = 0; i < lines.length; i += 1) {
    const nameMatch = lines[i].match(/^  - name: ([A-Za-z0-9-]+)$/);
    if (!nameMatch) continue;
    const pathMatch = lines[i + 1]?.match(/^    path: (patterns\/[^\s]+)$/);
    if (!pathMatch) {
      throw new Error(`patterns/PATTERN_MANIFEST.yml: missing path for ${nameMatch[1]}`);
    }
    entries.push({ name: nameMatch[1], path: pathMatch[1] });
    i += 1;
  }
  if (!entries.length) throw new Error("patterns/PATTERN_MANIFEST.yml has no patterns registered");
  return entries;
}

/**
 * Parse evaluations/manifest.yml.
 *
 * Each entry looks like:
 *
 *   - id: <eval-id>
 *     path: <eval-path>
 *     skill: <skill-name>
 */
export async function readEvaluationRegistry() {
  const text = await readRepoText("evaluations/manifest.yml").catch(() => "");
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  const entries = [];
  for (let i = 0; i < lines.length; i += 1) {
    const idMatch = lines[i].match(/^  - id: ([A-Za-z0-9-]+)$/);
    if (!idMatch) continue;
    const pathMatch = lines[i + 1]?.match(/^    path: (.+)$/);
    const skillMatch = lines[i + 2]?.match(/^    skill: ([A-Za-z0-9-]+)$/);
    if (!pathMatch || !skillMatch) {
      throw new Error(`evaluations/manifest.yml: incomplete entry at line ${i + 1}`);
    }
    entries.push({ id: idMatch[1], path: pathMatch[1], skill: skillMatch[1] });
    i += 2;
  }
  return entries;
}

/**
 * Parse benchmarks/manifest.yml for case count.
 *
 * The benchmark manifest uses a richer schema (see docs/BENCHMARK_SCHEMA.md);
 * for the bundle manifest we only need the case count and the fixture
 * count. We reuse validate-benchmarks.mjs as the source of truth and
 * count `  - id:` entries here.
 */
export async function readBenchmarkRegistry() {
  const text = await readRepoText("benchmarks/manifest.yml");
  const cases = [...text.matchAll(/^  - id: ([A-Za-z0-9-]+)$/gm)].map((m) => m[1]);
  const fixturesText = await readRepoText("benchmarks/fixtures/manifest.json").catch(() => "{}");
  let fixtures = 0;
  try {
    const parsed = JSON.parse(fixturesText);
    // The fixtures manifest is { version, schema, cases: [...] }.
    if (parsed && Array.isArray(parsed.cases)) fixtures = parsed.cases.length;
    else if (Array.isArray(parsed)) fixtures = parsed.length;
  } catch {
    // Fall back to 0; validate-fixtures.mjs is the canonical validator.
  }
  return { cases: cases.length, fixtures };
}

/** Return the current git commit hash, or "unknown" if git is unavailable. */
export function readSourceCommit() {
  try {
    return execSync("git rev-parse HEAD", { cwd: REPO_ROOT, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "unknown";
  }
}

/** Return the current ISO 8601 timestamp in UTC. */
export function buildTimestamp() {
  return new Date().toISOString();
}

/**
 * Read the bundle version.
 *
 * The version lives in packaging/BUNDLE_VERSION.txt so it can be bumped
 * in one place. Trailing whitespace is trimmed. Missing file is a
 * hard error — the bundle must be versioned.
 */
export async function readBundleVersion() {
  const text = await readRepoText("packaging/BUNDLE_VERSION.txt");
  const version = text.trim();
  if (!version) throw new Error("packaging/BUNDLE_VERSION.txt is empty");
  return version;
}

/**
 * Parse packaging/STARTER_SKILLS.yml and return the list of skill
 * names that should ship in the free starter bundle.
 *
 * The file is intentionally simple (a top-level `skills:` list of
 * `- name:` entries with a `reason:` line) so we parse it line-by-line
 * without a YAML dependency. Both build-starter-bundle.mjs and the
 * bundle-contract test read the list through this function so they
 * agree on the starter set.
 */
export async function readStarterSkillList() {
  const text = await readRepoText("packaging/STARTER_SKILLS.yml");
  const names = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^  - name: ([A-Za-z0-9-]+)$/);
    if (m) names.push(m[1]);
  }
  if (!names.length) {
    throw new Error("packaging/STARTER_SKILLS.yml lists no skills");
  }
  return names;
}
