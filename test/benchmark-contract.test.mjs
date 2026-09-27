import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("..", import.meta.url);

test("benchmark corpus is non-trivial and references registered skills", async () => {
  const manifest = await readFile(new URL("benchmarks/manifest.yml", root), "utf8");
  const skills = await readFile(new URL("skill-manifest.yml", root), "utf8");
  const registered = new Set([...skills.matchAll(/^  - name: ([A-Za-z0-9-]+)/gm)].map(([, name]) => name));
  const cases = [...manifest.matchAll(
    /^  - id: ([A-Za-z0-9-]+)\n    skill: ([A-Za-z0-9-]+)\n    checks: ([^\n]+)\n    prompt: ([^\n]+)$/gm
  )];

  assert.equal(cases.length, 31, "expected complete frontend benchmark corpus");
  const ids = new Set();
  for (const [, id, skill, checks, prompt] of cases) {
    assert.equal(ids.has(id), false, `duplicate benchmark id: ${id}`);
    ids.add(id);
    assert.equal(registered.has(skill), true, `unregistered benchmark skill: ${skill}`);
    assert.ok(checks.split(",").length >= 3);
    assert.ok(prompt.length > 20);
  }
});
