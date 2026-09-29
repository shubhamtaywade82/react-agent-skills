import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import { test } from "node:test";
import { join } from "node:path";

const root = new URL("..", import.meta.url);

async function skillFiles() {
  const dirs = await readdir(new URL("skills/", root), { withFileTypes: true });
  return dirs.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, "skill is missing YAML frontmatter");
  const name = match[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = match[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
  return { name, description };
}

test("skills use Agent Skills metadata constraints and intent-focused descriptions", async () => {
  const names = await skillFiles();
  assert.equal(names.length, 127, "skill inventory should remain complete");

  for (const name of names) {
    const content = await readFile(new URL(`skills/${name}/SKILL.md`, root), "utf8");
    const { name: declaredName, description } = parseFrontmatter(content);
    assert.equal(declaredName, name);
    assert.ok(description && description.length <= 1024, `${name} description must be <= 1024 characters`);
    assert.match(
      description.toLowerCase(),
      /use when|activate when|apply when|only when|for .*when|when .*$/,
      `${name} description should communicate when the skill applies`
    );
  }
});

test("skill-local references are explicit, shallow, and resolvable", async () => {
  const names = await skillFiles();
  let referenceDirectories = 0;

  for (const name of names) {
    const skillRoot = new URL(`skills/${name}/`, root);
    const skillContent = await readFile(new URL("SKILL.md", skillRoot), "utf8");
    assert.doesNotMatch(skillContent, /\.\.\/\.\.\/(references|scripts)\//, `${name} must not escape its skill root`);
    assert.doesNotMatch(skillContent, /(?:^|\])\(\/references\//, `${name} must not use root-absolute references`);

    const refs = skillContent.match(/(?:\(|\s)(references\/[^\s)\`]+)/g) ?? [];
    for (const raw of refs) {
      const path = raw.replace(/^\(|^\s/, "");
      assert.equal(path.split("/").length, 2, `${name} reference paths must be one level deep: ${path}`);
      await access(new URL(path, skillRoot));
    }

    try {
      await access(new URL("references/", skillRoot));
      referenceDirectories += 1;
    } catch {
      // Skill does not need progressive-disclosure resources.
    }
  }

  assert.ok(referenceDirectories >= 8, "high-context domains should have on-demand reference resources");
});

test("routing metadata avoids generic trigger collisions and delegates tool choice to evidence", async () => {
  const content = await readFile(new URL("skill-manifest.yml", root), "utf8");
  const triggerLines = [...content.matchAll(/^    triggers: \[(.*)\]$/gm)].map(([, value]) => value);
  const triggers = triggerLines.flatMap((line) =>
    line.split(",").map((value) => value.trim().replace(/^["']|["']$/g, "").toLowerCase()).filter(Boolean)
  );

  const generic = new Set([
    "action", "api", "browser test", "build", "cache", "component", "css", "effect",
    "fetch", "form", "formatting", "loading", "mutation", "package", "query", "render",
    "retry", "schema", "session", "state", "storage", "streaming", "test", "testing",
    "typescript", "validation", "xss", "deployment", "router", "store", "review"
  ]);

  assert.deepEqual(
    triggers.filter((trigger) => generic.has(trigger)),
    [],
    "routing triggers should be intent/tool-specific, not generic nouns"
  );

  const counts = new Map();
  for (const trigger of triggers) counts.set(trigger, (counts.get(trigger) ?? 0) + 1);
  const collisions = [...counts.entries()].filter(([, count]) => count > 1);
  assert.ok(collisions.length <= 10, `too many exact trigger collisions: ${collisions.length}`);

  const integration = await readFile(new URL("docs/AGENT_INTEGRATION.md", root), "utf8");
  assert.match(integration, /native Agent Skills discovery/i);
  assert.match(integration, /one primary skill/i);
});

test("deterministic skill scripts are documented and local", async () => {
  const expected = [
    ["frontend-generated-code", "scripts/check-generated-drift.mjs"],
    ["typescript-package-publishing", "scripts/validate-package-exports.mjs"],
    ["frontend-monorepo", "scripts/check-package-boundaries.mjs"]
  ];

  for (const [skill, script] of expected) {
    await access(new URL(`skills/${skill}/${script}`, root));
    const content = await readFile(new URL(`skills/${skill}/SKILL.md`, root), "utf8");
    assert.match(content, new RegExp(script.replace(/[.*+?^{}()|[\\]\\\\]/g, "\\$&")));
  }

  const routing = await readFile(new URL("router/ROUTING.md", root), "utf8");
  assert.match(routing, /native Agent Skills discovery/i);
  assert.match(routing, /primary skill/i);
});
