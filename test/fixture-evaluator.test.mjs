import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { collectSnapshot, evaluateScope, parseFixtureManifest } from "../scripts/fixture-evaluator.mjs";

test("fixture manifest parser returns fixture cases", () => {
  const manifest = JSON.stringify({
    version: 1,
    cases: [{ id: "case-a", prompt: "Do work", files: { "src/a.ts": "export const a = 1;" }, allowed_paths: ["src/a.ts"], verifiers: [] }]
  });
  const result = parseFixtureManifest(manifest);
  assert.equal(result[0].id, "case-a");
});

test("scope evaluator detects writes outside allowed paths", async () => {
  const root = await mkdtemp(join(tmpdir(), "fixture-eval-test-"));
  await writeFile(join(root, "allowed.txt"), "a");
  await writeFile(join(root, "unexpected.txt"), "b");
  const before = await collectSnapshot(root);
  await writeFile(join(root, "allowed.txt"), "changed");
  const after = await collectSnapshot(root);
  const result = evaluateScope(before, after, ["allowed.txt"]);
  assert.deepEqual(result, { allowed: true, changed: ["allowed.txt"], forbidden: [] });
});

test("fixture evaluator reports forbidden writes", async () => {
  const root = await mkdtemp(join(tmpdir(), "fixture-eval-test-"));
  await writeFile(join(root, "unexpected.txt"), "b");
  const before = new Map();
  const after = await collectSnapshot(root);
  const result = evaluateScope(before, after, ["allowed.txt"]);
  assert.equal(result.allowed, false);
  assert.deepEqual(result.forbidden, ["unexpected.txt"]);
});
