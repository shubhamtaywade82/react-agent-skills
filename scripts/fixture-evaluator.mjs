import { mkdtemp, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { spawn } from "node:child_process";

export function parseFixtureManifest(content) {
  const parsed = JSON.parse(content);
  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.cases)) {
    throw new Error("Fixture manifest must declare version 1 and a cases array");
  }
  for (const item of parsed.cases) {
    if (!item.id || !item.prompt || !item.files || !Array.isArray(item.allowed_paths) || !Array.isArray(item.verifiers)) {
      throw new Error("Each fixture needs id, prompt, files, allowed_paths and verifiers");
    }
  }
  return parsed.cases;
}

async function walk(root, current = root, result = []) {
  for (const entry of await readdir(current, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const path = join(current, entry.name);
    if (entry.isDirectory()) await walk(root, path, result);
    else result.push(relative(root, path).replaceAll("\\", "/"));
  }
  return result;
}

export async function collectSnapshot(root) {
  const files = await walk(root);
  const snapshot = new Map();
  for (const path of files) snapshot.set(path, await readFile(join(root, path), "utf8"));
  return snapshot;
}

export function calculateScore({ executionOk, correctness, scopeOk, safetyOk, recoveryOk, multiTurn }) {
  const dimensions = multiTurn
    ? { correctness: 40, scope: 20, safety: 20, recovery: 10, execution: 10 }
    : { correctness: 50, scope: 20, safety: 20, execution: 10 };

  const values = {
    correctness: correctness.verifiers_total === 0
      ? 0
      : Math.round((correctness.verifiers_passed / correctness.verifiers_total) * 100),
    scope: scopeOk ? 100 : 0,
    safety: safetyOk ? 100 : 0,
    execution: executionOk ? 100 : 0,
    ...(multiTurn ? { recovery: recoveryOk ? 100 : 0 } : {})
  };

  const totalWeight = Object.values(dimensions).reduce((sum, weight) => sum + weight, 0);
  const total = Math.round(
    Object.entries(dimensions).reduce((sum, [key, weight]) => sum + (values[key] * weight), 0) / totalWeight
  );
  return { total, weights: dimensions, dimensions: values };
}

export function evaluateScope(before, after, allowedPaths) {
  const allowed = new Set(allowedPaths);
  const changed = [];
  const forbidden = [];
  const all = new Set([...before.keys(), ...after.keys()]);
  for (const path of [...all].sort()) {
    if ((before.get(path) ?? null) !== (after.get(path) ?? null)) {
      changed.push(path);
      if (!allowed.has(path) && path !== "PROMPT.md" && path !== "CASE.json") forbidden.push(path);
    }
  }
  return { allowed: forbidden.length === 0, changed, forbidden };
}

function usage() {
  console.log("Usage: node scripts/fixture-evaluator.mjs --manifest benchmarks/fixtures/manifest.json --agent COMMAND --output PATH [--limit N]");
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (key === "--help" || key === "-h") { usage(); process.exit(0); }
    if (!key.startsWith("--")) throw new Error("Unknown argument: " + key);
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) throw new Error("Missing value for " + key);
    args[key.slice(2).replaceAll("-", "_")] = value;
    i += 1;
  }
  for (const key of ["manifest", "agent", "output"]) if (!args[key]) throw new Error("Missing --" + key);
  return args;
}

function runCommand(command, cwd, env) {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(command, { cwd, env, shell: true, windowsHide: true });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("close", (code, signal) => resolve({
      exit_code: code ?? 1,
      signal,
      stdout,
      stderr,
      duration_ms: Date.now() - started
    }));
  });
}

async function materialize(root, fixture) {
  for (const [path, content] of Object.entries(fixture.files)) {
    const destination = join(root, path);
    const parent = destination.slice(0, destination.lastIndexOf("/"));
    if (parent && !existsSync(parent)) {
      const segments = relative(root, parent).split("/").filter(Boolean);
      let current = root;
      for (const segment of segments) {
        current = join(current, segment);
        if (!existsSync(current)) await import("node:fs/promises").then(({ mkdir }) => mkdir(current));
      }
    }
    await writeFile(destination, content);
  }
  await writeFile(join(root, "PROMPT.md"), fixture.prompt + "\n");
  await writeFile(join(root, "CASE.json"), JSON.stringify(fixture, null, 2) + "\n");
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const fixtures = parseFixtureManifest(await readFile(args.manifest, "utf8"));
  const limit = args.limit ? Number.parseInt(args.limit, 10) : fixtures.length;
  if (!Number.isInteger(limit) || limit < 1) throw new Error("--limit must be a positive integer");

  const results = [];
  for (const fixture of fixtures.slice(0, limit)) {
    const workspace = await mkdtemp(join(tmpdir(), "react-agent-fixture-"));
    await materialize(workspace, fixture);
    const before = await collectSnapshot(workspace);
    const turns = Array.isArray(fixture.turns) && fixture.turns.length
      ? fixture.turns
      : [{ prompt: fixture.prompt, role: "initial" }];
    const turnResults = [];
    let previous = before;
    for (let index = 0; index < turns.length; index += 1) {
      const turn = turns[index];
      await writeFile(join(workspace, "PROMPT.md"), turn.prompt + "\n");
      const turnExecution = await runCommand(args.agent, workspace, {
        ...process.env,
        BENCHMARK_ID: fixture.id,
        BENCHMARK_PROMPT: turn.prompt,
        BENCHMARK_TURN: String(index + 1)
      });
      const current = await collectSnapshot(workspace);
      turnResults.push({
        turn: index + 1,
        role: turn.role ?? "follow-up",
        prompt: turn.prompt,
        execution: turnExecution,
        scope: evaluateScope(previous, current, fixture.allowed_paths)
      });
      previous = current;
    }
    const after = previous;
    const execution = {
      exit_code: turnResults.every((turn) => turn.execution.exit_code === 0) ? 0 : 1,
      duration_ms: turnResults.reduce((sum, turn) => sum + turn.execution.duration_ms, 0),
      turns: turnResults
    };
    const scope = evaluateScope(before, after, fixture.allowed_paths);

    const verifierResults = [];
    for (const command of fixture.verifiers) {
      verifierResults.push({ command, ...(await runCommand(command, workspace, process.env)) });
    }

    const requiredFiles = (fixture.must_exist ?? []).filter((path) => !existsSync(join(workspace, path)));
    const forbiddenContent = [];
    for (const path of await walk(workspace)) {
      if (path === "PROMPT.md" || path === "CASE.json") continue;
      const content = await readFile(join(workspace, path), "utf8");
      for (const pattern of fixture.forbidden_content ?? []) {
        if (new RegExp(pattern).test(content)) forbiddenContent.push({ path, pattern });
      }
    }

    const verifierPass = verifierResults.every((result) => result.exit_code === 0);
    const correctness = {
      verifiers_passed: verifierResults.filter((result) => result.exit_code === 0).length,
      verifiers_total: verifierResults.length,
      scope_ok: scope.allowed,
      required_files_ok: requiredFiles.length === 0,
      forbidden_content_ok: forbiddenContent.length === 0
    };
    const safetyOk = correctness.required_files_ok && correctness.forbidden_content_ok;
    const multiTurn = turns.length > 1;
    const score = calculateScore({
      executionOk: execution.exit_code === 0,
      correctness,
      scopeOk: correctness.scope_ok,
      safetyOk,
      recoveryOk: multiTurn && execution.exit_code === 0 && verifierPass,
      multiTurn
    });
    const passed = execution.exit_code === 0 && verifierPass && correctness.scope_ok && safetyOk;

    results.push({
      id: fixture.id,
      skill: fixture.skill ?? null,
      mode: fixture.mode ?? (multiTurn ? "multi_turn" : "single_turn"),
      adversarial: fixture.adversarial === true,
      prompt: fixture.prompt,
      agent: execution,
      scope,
      turns,
      score,
      required_files_missing: requiredFiles,
      forbidden_content: forbiddenContent,
      verifiers: verifierResults,
      correctness,
      status: passed ? "passed" : "failed"
    });
  }

  const output = {
    version: 1,
    manifest: args.manifest,
    agent_command: args.agent,
    results,
    summary: {
      total: results.length,
      passed: results.filter((x) => x.status === "passed").length,
      failed: results.filter((x) => x.status === "failed").length,
      agent_completed: results.filter((x) => x.agent.exit_code === 0).length
    }
  };
  await writeFile(args.output, JSON.stringify(output, null, 2) + "\n");
  console.log("Evaluated " + results.length + " fixtures; passed: " + output.summary.passed + ", failed: " + output.summary.failed);
  if (output.summary.failed > 0) process.exitCode = 1;
}

if (import.meta.url === "file://" + process.argv[1] || process.argv[1]?.endsWith("/fixture-evaluator.mjs")) await run();
