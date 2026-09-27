import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { test } from "node:test";

const exec = promisify(execFile);
const root = new URL("..", import.meta.url);

test("benchmark runner executes an agent command and records evidence", async () => {
  const temp = await mkdtemp(join(tmpdir(), "react-agent-benchmark-"));
  const manifest = join(temp, "manifest.yml");
  const output = join(temp, "result.json");
  await import("node:fs/promises").then(({ writeFile }) => writeFile(manifest, [
    "version: 1",
    "cases:",
    "  - id: smoke",
    "    skill: agent-workflow",
    "    checks: functional,tests,scope_control",
    "    prompt: Run a smoke benchmark and return success."
  ].join("\n")));
  const runner = new URL("scripts/benchmark-runner.mjs", root);

  await exec(process.execPath, [
    runner.pathname,
    "--manifest", manifest,
    "--agent", process.execPath + " -e \"process.stdout.write(process.env.BENCHMARK_ID)\"",
    "--output", output
  ]);

  const result = JSON.parse(await readFile(output, "utf8"));
  assert.equal(result.cases.length, 1);
  assert.equal(result.cases[0].id, "smoke");
  assert.equal(result.cases[0].exit_code, 0);
  assert.equal(result.cases[0].stdout, "smoke");
});
