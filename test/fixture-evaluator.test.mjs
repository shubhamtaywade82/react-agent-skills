import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  calculateScore,
  evaluateScope,
  materializeFixture,
  parseFixtureManifest,
  safeResolve
} from "../scripts/fixture-evaluator.mjs";

test("fixture manifest parser rejects traversal and requires independent verifier sources", () => {
  assert.throws(
    () => parseFixtureManifest(JSON.stringify({
      version: 1,
      cases: [{
        id: "unsafe",
        prompt: "A sufficiently long fixture prompt",
        files: { "../escape.mjs": "bad" },
        allowed_paths: [],
        verifier_files: { "verify.mjs": "export {}" },
        verifiers: ["node ${FIXTURE_ORACLE_ROOT}/verify.mjs"]
      }]
    })),
    /Unsafe fixture path/
  );
});

test("fixture materialization keeps verifier source outside the agent workspace", async () => {
  const workspace = await mkdtemp(join(tmpdir(), "fixture-workspace-"));
  const oracle = await mkdtemp(join(tmpdir(), "fixture-oracle-"));
  const fixture = {
    id: "hidden-oracle",
    prompt: "Use the fixture to implement the requested behavior.",
    files: { "src/example.mjs": "export const answer = 41;\n" },
    allowed_paths: ["src/example.mjs"],
    verifier_files: { "verify.mjs": "export const expected = 42;\n" },
    verifiers: ["node ${FIXTURE_ORACLE_ROOT}/verify.mjs"]
  };

  await materializeFixture(workspace, oracle, fixture);

  assert.equal(existsSync(join(workspace, "verify.mjs")), false);
  assert.equal(existsSync(join(oracle, "verify.mjs")), true);
  assert.equal(await readFile(join(workspace, "src/example.mjs"), "utf8"), "export const answer = 41;\n");
});

test("safeResolve blocks absolute and parent traversal", async () => {
  const root = await mkdtemp(join(tmpdir(), "fixture-root-"));
  assert.equal(safeResolve(root, "src/example.mjs").startsWith(root), true);
  assert.throws(() => safeResolve(root, "../escape"), /Unsafe fixture path/);
  assert.throws(() => safeResolve(root, "/tmp/escape"), /Unsafe fixture path/);
});

test("scope and scoring preserve hard safety failures", () => {
  const before = new Map([["src/a.mjs", "a"]]);
  const after = new Map([["src/a.mjs", "b"], ["extra.mjs", "x"]]);
  const scope = evaluateScope(before, after, ["src/a.mjs"]);
  assert.equal(scope.allowed, false);
  assert.deepEqual(scope.forbidden, ["extra.mjs"]);

  const score = calculateScore({
    executionOk: true,
    correctness: { verifiers_passed: 2, verifiers_total: 2 },
    scopeOk: true,
    safetyOk: false,
    recoveryOk: true,
    multiTurn: true
  });
  assert.equal(score.passed, false);
  assert.equal(score.dimensions.safety, 0);
});

test("multi-turn scoring can pass after an intermediate failed turn is recovered", () => {
  const score = calculateScore({
    executionOk: true,
    correctness: { verifiers_passed: 1, verifiers_total: 1 },
    scopeOk: true,
    safetyOk: true,
    recoveryOk: true,
    multiTurn: true
  });
  assert.equal(score.passed, true);
});
