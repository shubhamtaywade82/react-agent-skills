import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("..", import.meta.url);

test("pattern registry is present and every registered pattern is real", async () => {
  const manifest = await readFile(new URL("patterns/PATTERN_MANIFEST.yml", root), "utf8");
  const entries = [...manifest.matchAll(/^  - name: ([A-Za-z0-9-]+)\n    path: (patterns\/[^\n]+)$/gm)];
  assert.ok(entries.length >= 28, "expected migrated React/TypeScript pattern inventory");

  for (const [, name, path] of entries) {
    assert.match(name, /^[a-z0-9-]+$/);
    const content = await readFile(new URL(path, root), "utf8");
    assert.ok(content.trim(), `empty pattern: ${name}`);
  }
});
