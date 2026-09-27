import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

function usage() {
  console.log(`Usage: node scripts/benchmark-runner.mjs --manifest PATH --agent COMMAND --output PATH [--limit N]`);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (key === "--help" || key === "-h") {
      usage();
      process.exit(0);
    }
    if (!key.startsWith("--")) throw new Error(`Unknown argument: ${key}`);
    const name = key.slice(2).replaceAll("-", "_");
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for ${key}`);
    args[name] = value;
    i += 1;
  }
  for (const required of ["manifest", "agent", "output"]) {
    if (!args[required]) throw new Error(`Missing --${required}`);
  }
  return args;
}

function parseCases(content) {
  return [...content.matchAll(
    /^  - id: ([A-Za-z0-9-]+)\n    skill: ([A-Za-z0-9-]+)\n    checks: ([^\n]+)\n    prompt: ([^\n]+)$/gm
  )].map(([, id, skill, checks, prompt]) => ({
    id,
    skill,
    checks: checks.split(",").map((check) => check.trim()).filter(Boolean),
    prompt
  }));
}

function runAgent(command, cwd, env) {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(command, {
      cwd,
      env,
      shell: true,
      windowsHide: true
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("close", (code, signal) => {
      resolve({
        exit_code: code ?? 1,
        signal,
        stdout,
        stderr,
        duration_ms: Date.now() - started
      });
    });
  });
}

const args = parseArgs(process.argv.slice(2));
const manifest = await readFile(args.manifest, "utf8");
const cases = parseCases(manifest);
if (!cases.length) throw new Error("Manifest contains no benchmark cases");

const limit = args.limit ? Number.parseInt(args.limit, 10) : cases.length;
if (!Number.isInteger(limit) || limit < 1) throw new Error("--limit must be a positive integer");

const results = [];
for (const benchmarkCase of cases.slice(0, limit)) {
  const workspace = await mkdtemp(join(tmpdir(), `react-agent-case-${benchmarkCase.id}-`));
  await writeFile(join(workspace, "PROMPT.md"), benchmarkCase.prompt + "\n");
  await writeFile(join(workspace, "CASE.json"), JSON.stringify(benchmarkCase, null, 2) + "\n");

  const execution = await runAgent(args.agent, workspace, {
    ...process.env,
    BENCHMARK_ID: benchmarkCase.id,
    BENCHMARK_SKILL: benchmarkCase.skill,
    BENCHMARK_PROMPT: benchmarkCase.prompt
  });

  results.push({
    id: benchmarkCase.id,
    skill: benchmarkCase.skill,
    checks: benchmarkCase.checks,
    prompt: benchmarkCase.prompt,
    ...execution,
    status: execution.exit_code === 0 ? "agent_completed" : "agent_failed"
  });
}

await writeFile(args.output, JSON.stringify({
  version: 1,
  manifest: args.manifest,
  agent_command: args.agent,
  cases: results
}, null, 2) + "\n");

const failed = results.filter((result) => result.exit_code !== 0).length;
console.log(`Executed ${results.length} benchmark cases; agent failures: ${failed}.`);
