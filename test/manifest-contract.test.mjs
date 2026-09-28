import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("..", import.meta.url);

function parseRegistry(content) {
  const lines = content.split(/\r?\n/);
  const entries = [];
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^  - name: ([A-Za-z0-9-]+)$/);
    if (!match) continue;
    const pathMatch = lines[index + 1]?.match(/^    path: (patterns\/[^\s]+)$/);
    assert.ok(pathMatch, `missing path for pattern ${match[1]}`);
    entries.push({ name: match[1], path: pathMatch[1] });
    index += 1;
  }
  return entries;
}

test("pattern registry is present and every registered pattern is real", async () => {
  const manifest = await readFile(new URL("patterns/PATTERN_MANIFEST.yml", root), "utf8");
  const entries = parseRegistry(manifest);
  assert.equal(entries.length, 60, "expected complete frontend pattern inventory");

  for (const { name, path } of entries) {
    assert.match(name, /^[a-z0-9-]+$/);
    const content = await readFile(new URL(path, root), "utf8");
    assert.ok(content.trim(), `empty pattern: ${name}`);
  }
});

test("evaluation registry references real, registered skills and complete contracts", async () => {
  const manifest = await readFile(new URL("evaluations/manifest.yml", root), "utf8");
  const skillManifest = await readFile(new URL("skill-manifest.yml", root), "utf8");
  const skillNames = new Set([...skillManifest.matchAll(/^  - name: ([A-Za-z0-9-]+)$/gm)].map(([, name]) => name));
  const lines = manifest.split(/\r?\n/);
  const entries = [];
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^  - id: ([A-Za-z0-9-]+)$/);
    if (!match) continue;
    const path = lines[index + 1]?.match(/^    path: (.+)$/);
    const skill = lines[index + 2]?.match(/^    skill: ([A-Za-z0-9-]+)$/);
    assert.ok(path && skill, `incomplete evaluation ${match[1]}`);
    entries.push({ id: match[1], path: path[1], skill: skill[1] });
    index += 2;
  }
  assert.ok(entries.length >= 39, "evaluation inventory must not shrink");

  for (const { id, path, skill } of entries) {
    assert.match(id, /^[a-z0-9-]+$/);
    assert.ok(skillNames.has(skill), `unregistered skill for evaluation ${id}: ${skill}`);
    const content = await readFile(new URL(path, root), "utf8");
    for (const required of ["id:", "version:", "prompt:", "checks:"]) {
      assert.ok(content.includes(required), `evaluation ${id} is missing ${required}`);
    }
  }
});
