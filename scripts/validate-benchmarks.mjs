import { readFile } from "node:fs/promises";

const root = new URL("..", import.meta.url);
const benchmark = await readFile(new URL("benchmarks/manifest.yml", root), "utf8");
const skills = await readFile(new URL("skill-manifest.yml", root), "utf8");

const registered = new Set([...skills.matchAll(/^  - name: ([A-Za-z0-9-]+)/gm)].map(([, name]) => name));
const cases = [...benchmark.matchAll(
  /^  - id: ([A-Za-z0-9-]+)\n    skill: ([A-Za-z0-9-]+)\n    checks: ([^\n]+)\n    prompt: ([^\n]+)$/gm
)];

const errors = [];
const ids = new Set();
for (const [, id, skill, checks, prompt] of cases) {
  if (ids.has(id)) errors.push("Duplicate benchmark id: " + id);
  ids.add(id);
  if (!registered.has(skill)) errors.push("Unregistered benchmark skill: " + skill);
  if (checks.split(",").length < 3) errors.push("Benchmark needs at least 3 checks: " + id);
  if (prompt.trim().length < 20) errors.push("Benchmark prompt is too short: " + id);
}
if (!cases.length) errors.push("No benchmark cases registered");
if (errors.length) {
  console.error(errors.map((e) => "- " + e).join("\n"));
  process.exit(1);
}
console.log("Validated " + cases.length + " benchmark cases.");
