import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { test } from "node:test";

const exec = promisify(execFile);
const root = new URL("..", import.meta.url);

test("skill discovery benchmark corpus is present and non-trivial", async () => {
  const manifestPath = new URL("benchmarks/discovery/manifest.json", root);
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

  assert.equal(manifest.version, 1);
  assert.ok(Array.isArray(manifest.cases));
  assert.ok(manifest.cases.length >= 24, "discovery corpus should contain representative positive and near-miss cases");

  const ids = new Set();
  for (const entry of manifest.cases) {
    assert.match(entry.id, /^[a-z0-9-]+$/);
    assert.equal(ids.has(entry.id), false, "duplicate discovery case: " + entry.id);
    ids.add(entry.id);
    assert.ok(entry.query?.length >= 20);
    assert.ok(
      typeof entry.expected_skill === "string" || entry.expected_skill === null,
      entry.id + " must declare expected_skill or null for a near-miss"
    );
  }
});

test("skill discovery evaluator accepts the checked-in corpus", async () => {
  await access(new URL("scripts/skill-discovery-evaluator.mjs", root));

  let stdout = "";
  let stderr = "";
  try {
    ({ stdout, stderr } = await exec(process.execPath, [
      new URL("scripts/skill-discovery-evaluator.mjs", root).pathname,
      "--manifest", new URL("benchmarks/discovery/manifest.json", root).pathname,
      "--check"
    ]));
  } catch (error) {
    assert.fail("skill discovery evaluator failed to execute: " + (error.stderr || stderr || "") + (error.stdout || stdout || ""));
  }

  const result = JSON.parse(stdout);
  assert.equal(result.version, 1);
  assert.ok(result.summary.total >= 24);
  assert.equal(result.summary.failed, 0, JSON.stringify(result.cases.filter((entry) => !entry.pass), null, 2));
  assert.equal(result.summary.passed, result.summary.total);
});

test("discovery benchmark measures native Agent Skills metadata, not local routing triggers", async () => {
  const content = await readFile(new URL("scripts/skill-discovery-evaluator.mjs", root), "utf8");
  assert.match(content, /SKILL\.md/);
  assert.match(content, /description/);
  assert.doesNotMatch(content, /skill-manifest.*triggers/);
});
