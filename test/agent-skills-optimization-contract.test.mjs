import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const skillsRoot = join(root, "skills");

async function listSkillDirs() {
  return (await readdir(skillsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, "skill must have YAML frontmatter");
  const name = match[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = match[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
  assert.ok(name, "skill frontmatter needs name");
  assert.ok(description, "skill frontmatter needs description");
  return { name, description };
}

test("the pack uses progressive disclosure through skill-local references", async () => {
  const dirs = await listSkillDirs();
  const referenceSkills = [
    "react-19-modern-apis",
    "react-accessibility-widgets",
    "typescript-version-migration",
    "typescript-package-publishing",
    "nextjs",
    "frontend-generated-code",
    "frontend-codemod-migration"
  ];

  for (const skill of referenceSkills) {
    const refRoot = join(skillsRoot, skill, "references");
    const entries = await readdir(refRoot, { withFileTypes: true });
    assert.ok(
      entries.some((entry) => entry.isFile() && entry.name.endsWith(".md")),
      skill + " must expose at least one on-demand reference"
    );

    const skillText = await readFile(join(skillsRoot, skill, "SKILL.md"), "utf8");
    assert.match(skillText, /references\/[^\n]+/);
  }

  assert.ok(dirs.length >= 127, "skill inventory must remain intact");
});

test("native skill discovery remains primary and the custom manifest is tooling metadata", async () => {
  const agents = await readFile(join(root, "AGENTS.md"), "utf8");
  const integration = await readFile(join(root, "docs/AGENT_INTEGRATION.md"), "utf8");
  assert.match(agents, /native skill discovery/i);
  assert.match(agents, /manifest.*tooling|tooling.*manifest/i);
  assert.match(integration, /native skill discovery/i);
  assert.doesNotMatch(integration, /manifest.*must.*discover/i);
});

test("skill descriptions are concise activation metadata", async () => {
  for (const skill of await listSkillDirs()) {
    const content = await readFile(join(skillsRoot, skill, "SKILL.md"), "utf8");
    const { name, description } = parseFrontmatter(content);
    assert.equal(name, skill);
    assert.ok(description.length >= 40, skill + " description is too thin");
    assert.ok(description.length <= 300, skill + " description is too long");
    assert.doesNotMatch(description, /comprehensive|complete guide|best practices/i);
  }
});

test("routing metadata does not rely on generic one-word triggers", async () => {
  const manifest = await readFile(join(root, "skill-manifest.yml"), "utf8");
  const generic = new Set([
    "api", "action", "browser", "build", "cache", "component", "css", "deployment",
    "effect", "error", "fetch", "form", "loading", "mutation", "query", "refresh",
    "retry", "schema", "storage", "streaming", "testing", "validation"
  ]);

  const seen = new Map();
  for (const match of manifest.matchAll(/^    triggers: \[(.*)\]$/gm)) {
    for (const raw of match[1].split(",")) {
      const trigger = raw.trim().replace(/^["']|["']$/g, "").toLowerCase();
      if (!trigger) continue;
      seen.set(trigger, (seen.get(trigger) ?? 0) + 1);
    }
  }

  const genericDuplicates = [...seen.entries()].filter(([trigger, count]) => generic.has(trigger) && count > 1);
  assert.equal(genericDuplicates.length, 0, JSON.stringify(genericDuplicates));
});

test("deterministic skill scripts are present for recurring package and migration checks", async () => {
  for (const path of [
    "skills/typescript-package-publishing/scripts/inspect-package-exports.mjs",
    "skills/frontend-codemod-migration/scripts/check-diff-scope.mjs"
  ]) {
    await access(join(root, path));
  }
});
