import { readFile } from "node:fs/promises";

const root = new URL("..", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("benchmarks/fixtures/manifest.json", root), "utf8"));
const errors = [];
if (manifest.version !== 1) errors.push("Fixture manifest version must be 1");
if (!Array.isArray(manifest.cases) || !manifest.cases.length) errors.push("No fixture cases registered");

const ids = new Set();
for (const fixture of manifest.cases ?? []) {
  if (ids.has(fixture.id)) errors.push("Duplicate fixture id: " + fixture.id);
  ids.add(fixture.id);
  if (!fixture.prompt || fixture.prompt.length < 20) errors.push("Fixture prompt is too short: " + fixture.id);
  if (!fixture.files || typeof fixture.files !== "object") errors.push("Missing files: " + fixture.id);
  if (!Array.isArray(fixture.allowed_paths)) errors.push("Missing allowed_paths: " + fixture.id);
  if (!Array.isArray(fixture.verifiers) || fixture.verifiers.length < 1) errors.push("Fixture needs an independent verifier: " + fixture.id);
  if (fixture.mode && !["single_turn", "multi_turn", "adversarial"].includes(fixture.mode)) errors.push("Invalid fixture mode: " + fixture.id);
  if (fixture.mode === "multi_turn" && (!Array.isArray(fixture.turns) || fixture.turns.length < 2)) errors.push("Multi-turn fixture needs at least two turns: " + fixture.id);
  if (fixture.turns && fixture.turns.some((turn) => !turn || typeof turn.prompt !== "string" || turn.prompt.length < 10)) errors.push("Invalid turn prompt: " + fixture.id);
  if (fixture.mode === "adversarial" && fixture.adversarial !== true) errors.push("Adversarial fixture must set adversarial=true: " + fixture.id);
  for (const path of Object.keys(fixture.files ?? {})) {
    if (path.startsWith("/") || path.includes("..")) errors.push("Unsafe fixture file path: " + fixture.id + ":" + path);
  }
  for (const path of Object.keys(fixture.files ?? {})) {
    if (/(^|\/)(verify|verifier|oracle)[^/]*\.(mjs|js|ts)$/.test(path) && fixture.allowed_paths.includes(path)) {
      errors.push("Verifier must not be an allowed path: " + fixture.id + ":" + path);
    }
  }
}

if (errors.length) {
  console.error(errors.map((error) => "- " + error).join("\n"));
  process.exit(1);
}
console.log("Validated " + (manifest.cases?.length ?? 0) + " fixture evaluation cases.");
