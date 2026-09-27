import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("..", import.meta.url);

test("pattern registry is present and every registered pattern is real", async () => {
  const manifest = await readFile(new URL("patterns/PATTERN_MANIFEST.yml", root), "utf8");
  const entries = [...manifest.matchAll(/^  - name: ([A-Za-z0-9-]+)\n    path: (patterns\/[^\n]+)$/gm)];
  assert.ok(entries.length >= 60, "expected migrated React/TypeScript pattern inventory");

  for (const [, name, path] of entries) {
    assert.match(name, /^[a-z0-9-]+$/);
    const content = await readFile(new URL(path, root), "utf8");
    assert.ok(content.trim(), `empty pattern: ${name}`);
  }
});

test("evaluation registry references real, registered skills and complete contracts", async () => {
  const manifest = await readFile(new URL("evaluations/manifest.yml", root), "utf8");
  const skillManifest = await readFile(new URL("skill-manifest.yml", root), "utf8");
  const skillNames = new Set([...skillManifest.matchAll(/^  - name: ([A-Za-z0-9-]+)/gm)].map(([, name]) => name));
  const entries = [...manifest.matchAll(/^  - id: ([A-Za-z0-9-]+)\n    path: ([^\n]+)\n    skill: ([A-Za-z0-9-]+)$/gm)];
  assert.ok(entries.length >= 11, "expected split React/TypeScript evaluation inventory");

  for (const [, id, path, skill] of entries) {
    assert.match(id, /^[a-z0-9-]+$/);
    assert.ok(skillNames.has(skill), `unregistered skill for evaluation ${id}: ${skill}`);
    const content = await readFile(new URL(path, root), "utf8");
    for (const required of ["id:", "version:", "prompt:", "checks:"]) {
      assert.ok(content.includes(required), `evaluation ${id} is missing ${required}`);
    }
  }
});
