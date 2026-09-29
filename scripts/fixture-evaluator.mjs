import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve, isAbsolute } from "node:path";
import { pathToFileURL } from "node:url";
import { spawn } from "node:child_process";

function assertSafePath(path, label = "fixture path") {
  if (typeof path !== "string" || !path.trim() || isAbsolute(path) || path.split(/[\\/]/).includes("..")) {
    throw new Error("Unsafe fixture path: " + label + ": " + String(path));
  }
  return path.replaceAll("\\", "/");
}

export function safeResolve(root, path) {
  const relativePath = assertSafePath(path);
  const rootPath = resolve(root);
  const target = resolve(rootPath, relativePath);
  if (target !== rootPath && !target.startsWith(rootPath + "/")) {
    throw new Error("Unsafe fixture path: " + path);
  }
  return target;
}

export function parseFixtureManifest(content) {
  const parsed = JSON.parse(content);
  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.cases)) {
    throw new Error("Fixture manifest must declare version 1 and a cases array");
  }

  const ids = new Set();
  for (const item of parsed.cases) {
    if (!item || !item.id || !item.prompt || !item.files || !Array.isArray(item.allowed_paths)) {
      throw new Error("Each fixture needs id, prompt, files and allowed_paths");
    }
    if (ids.has(item.id)) throw new Error("Duplicate fixture id: " + item.id);
    ids.add(item.id);

    for (const path of Object.keys(item.files)) assertSafePath(path, item.id);
    for (const path of item.allowed_paths) assertSafePath(path, item.id + " allowed path");

    if (!item.verifier_files || typeof item.verifier_files !== "object" || Array.isArray(item.verifier_files)) {
      throw new Error("Fixture needs verifier_files: " + item.id);
    }
    const verifierPaths = Object.keys(item.verifier_files);
    if (!verifierPaths.length) throw new Error("Fixture needs at least one verifier file: " + item.id);
    for (const path of verifierPaths) {
      assertSafePath(path, item.id + " verifier path");
      if (item.allowed_paths.includes(path)) {
        throw new Error("Verifier must not be an allowed path: " + item.id + ":" + path);
      }
    }
    if (!Array.isArray(item.verifiers) || item.verifiers.length < 1) {
      throw new Error("Fixture needs at least one independent verifier: " + item.id);
    }

    const mode = item.mode ?? "single_turn";
    if (!["single_turn", "multi_turn", "adversarial"].includes(mode)) {
      throw new Error("Invalid fixture mode: " + item.id);
    }
    if (mode === "multi_turn" && (!Array.isArray(item.turns) || item.turns.length < 2)) {
      throw new Error("Multi-turn fixture needs at least two turns: " + item.id);
    }
    if (item.turns?.some((turn) => !turn || typeof turn.prompt !== "string" || turn.prompt.length < 10)) {
      throw new Error("Invalid turn prompt: " + item.id);
    }
    if (mode === "adversarial" && item.adversarial !== true) {
      throw new Error("Adversarial fixture must set adversarial=true: " + item.id);
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

export function evaluateScope(before, after, allowedPaths) {
  const allowed = new Set(allowedPaths.map((path) => assertSafePath(path)));
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

export function calculateScore({ executionOk, correctness, scopeOk, safetyOk, recoveryOk, multiTurn }) {
  const weights = multiTurn
    ? { correctness: 40, scope: 20, safety: 20, recovery: 10, execution: 10 }
    : { correctness: 50, scope: 20, safety: 20, execution: 10 };

  const dimensions = {
    correctness: correctness.verifiers_total
      ? Math.round((correctness.verifiers_passed / correctness.verifiers_total) * 100)
      : 0,
    scope: scopeOk ? 100 : 0,
    safety: safetyOk ? 100 : 0,
    execution: executionOk ? 100 : 0,
    ...(multiTurn ? { recovery: recoveryOk ? 100 : 0 } : {})
  };

  const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0);
  const total = Math.round(
    Object.entries(weights).reduce((sum, [key, weight]) => sum + dimensions[key] * weight, 0) / totalWeight
  );

  return {
    total,
    passed: executionOk && correctness.verifiers_total > 0 && correctness.verifiers_passed === correctness.verifiers_total &&
      scopeOk && safetyOk && (!multiTurn || recoveryOk),
    weights,
    dimensions
  };
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
  for (const key of ["manifest", "agent", "output"]) {
    if (!args[key]) throw new Error("Missing --" + key);
  }
  return args;
}

function runCommand(command, cwd, env) {
  return new Promise((resolvePromise) => {
    const started = Date.now();
    const child = spawn(command, { cwd, env, shell: true, windowsHide: true });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("close", (code, signal) => resolvePromise({
      exit_code: code ?? 1,
      signal,
      stdout,
      stderr,
      duration_ms: Date.now() - started
    }));
  });
}

export async function materializeFixture(workspace, oracleRoot, fixture) {
  for (const [path, content] of Object.entries(fixture.files)) {
    const destination = safeResolve(workspace, path);
    const parent = destination.slice(0, destination.lastIndexOf("/"));
    if (parent && !existsSync(parent)) await import("node:fs/promises").then(({ mkdir }) => mkdir(parent, { recursive: true }));
    await writeFile(destination, content);
  }

  for (const [path, content] of Object.entries(fixture.verifier_files)) {
    const destination = safeResolve(oracleRoot, path);
    const parent = destination.slice(0, destination.lastIndexOf("/"));
    if (parent && !existsSync(parent)) await import("node:fs/promises").then(({ mkdir }) => mkdir(parent, { recursive: true }));
    await writeFile(destination, content);
  }

  await writeFile(join(workspace, "PROMPT.md"), fixture.prompt + "\n");
  await writeFile(join(workspace, "CASE.json"), JSON.stringify({
    id: fixture.id,
    skill: fixture.skill ?? null,
    mode: fixture.mode ?? "single_turn",
    allowed_paths: fixture.allowed_paths
  }, null, 2) + "\n");
}

function verifierEnv(workspace, oracleRoot, fixture) {
  return {
    ...process.env,
    BENCHMARK_ID: fixture.id,
    BENCHMARK_PROMPT: fixture.prompt,
    FIXTURE_WORKSPACE: workspace,
    FIXTURE_ORACLE_ROOT: oracleRoot
  };
}

async function runFixture(fixture, agentCommand) {
  const workspace = await mkdtemp(join(tmpdir(), "react-agent-fixture-"));
  const oracleRoot = await mkdtemp(join(tmpdir(), "react-agent-oracle-"));

  try {
    await materializeFixture(workspace, oracleRoot, fixture);
    const before = await collectSnapshot(workspace);
    const turns = fixture.turns?.length ? fixture.turns : [{ role: "initial", prompt: fixture.prompt }];
    const turnResults = [];
    let previous = before;

    for (let index = 0; index < turns.length; index += 1) {
      const turn = turns[index];
      await writeFile(join(workspace, "PROMPT.md"), turn.prompt + "\n");
      const execution = await runCommand(agentCommand, workspace, {
        ...verifierEnv(workspace, oracleRoot, fixture),
        BENCHMARK_TURN: String(index + 1)
      });
      const current = await collectSnapshot(workspace);
      turnResults.push({
        turn: index + 1,
        role: turn.role ?? "follow-up",
        prompt: turn.prompt,
        execution,
        scope: evaluateScope(previous, current, fixture.allowed_paths)
      });
      previous = current;
    }

    const after = previous;
    const executionOk = turnResults.at(-1)?.execution.exit_code === 0;
    const scope = evaluateScope(before, after, fixture.allowed_paths);

    const verifierResults = [];
    for (const command of fixture.verifiers) {
      verifierResults.push({
        command,
        ...(await runCommand(command, oracleRoot, verifierEnv(workspace, oracleRoot, fixture)))
      });
    }

    const requiredFilesMissing = (fixture.must_exist ?? [])
      .filter((path) => !existsSync(safeResolve(workspace, path)));

    const forbiddenContent = [];
    for (const path of await walk(workspace)) {
      if (path === "PROMPT.md" || path === "CASE.json") continue;
      const content = await readFile(safeResolve(workspace, path), "utf8");
      for (const pattern of fixture.forbidden_content ?? []) {
        if (new RegExp(pattern).test(content)) forbiddenContent.push({ path, pattern });
      }
    }

    const correctness = {
      verifiers_passed: verifierResults.filter((result) => result.exit_code === 0).length,
      verifiers_total: verifierResults.length,
      scope_ok: scope.allowed,
      required_files_ok: requiredFilesMissing.length === 0,
      forbidden_content_ok: forbiddenContent.length === 0
    };
    const safetyOk = correctness.required_files_ok && correctness.forbidden_content_ok;
    const multiTurn = turns.length > 1;
    const recoveryOk = !multiTurn ||
      (turnResults.length >= 2 &&
        turnResults.slice(0, -1).some((turn) => turn.execution.exit_code !== 0 || !turn.scope.allowed) &&
        turnResults.at(-1).execution.exit_code === 0 &&
        verifierResults.every((result) => result.exit_code === 0));

    const score = calculateScore({
      executionOk,
      correctness,
      scopeOk: correctness.scope_ok,
      safetyOk,
      recoveryOk: multiTurn ? recoveryOk : true,
      multiTurn
    });

    return {
      id: fixture.id,
      skill: fixture.skill ?? null,
      mode: fixture.mode ?? (multiTurn ? "multi_turn" : "single_turn"),
      adversarial: fixture.adversarial === true,
      prompt: fixture.prompt,
      agent: { exit_code: executionOk ? 0 : 1, turns: turnResults },
      scope,
      score,
      required_files_missing: requiredFilesMissing,
      forbidden_content: forbiddenContent,
      verifiers: verifierResults,
      correctness,
      recovery: multiTurn ? { required: true, ok: recoveryOk } : null,
      status: score.passed ? "passed" : "failed"
    };
  } finally {
    await Promise.allSettled([rm(workspace, { recursive: true, force: true }), rm(oracleRoot, { recursive: true, force: true })]);
  }
}

export async function evaluateFixtures({ manifestPath, agentCommand, limit }) {
  const fixtures = parseFixtureManifest(await readFile(manifestPath, "utf8"));
  const max = limit ?? fixtures.length;
  if (!Number.isInteger(max) || max < 1) throw new Error("limit must be a positive integer");

  const results = [];
  for (const fixture of fixtures.slice(0, max)) {
    results.push(await runFixture(fixture, agentCommand));
  }
  return results;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const results = await evaluateFixtures({
    manifestPath: args.manifest,
    agentCommand: args.agent,
    limit: args.limit ? Number.parseInt(args.limit, 10) : undefined
  });
  const summary = {
    total: results.length,
    passed: results.filter((result) => result.status === "passed").length,
    failed: results.filter((result) => result.status === "failed").length
  };
  await writeFile(args.output, JSON.stringify({
    version: 1,
    manifest: args.manifest,
    agent_command: args.agent,
    results,
    summary
  }, null, 2) + "\n");
  console.log("Evaluated " + summary.total + " fixtures; passed: " + summary.passed + ", failed: " + summary.failed);
  if (summary.failed > 0) process.exitCode = 1;
}

if (process.argv[1]?.endsWith("/fixture-evaluator.mjs")) await main();
