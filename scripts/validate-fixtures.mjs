import { readFile } from "node:fs/promises";
import { isAbsolute } from "node:path";

const root = new URL("..", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("benchmarks/fixtures/manifest.json", root), "utf8"));
const errors = [];

if (manifest.version !== 1) errors.push("Fixture manifest version must be 1");
if (!Array.isArray(manifest.cases) || !manifest.cases.length) errors.push("No fixture cases registered");

const ids = new Set();
for (const fixture of manifest.cases ?? []) {
  if (!fixture.id || fixture.prompt?.length < 20 || !fixture.files || !Array.isArray(fixture.allowed_paths)) {
    errors.push("Incomplete fixture: " + fixture.id);
    continue;
  }
  if (ids.has(fixture.id)) errors.push("Duplicate fixture id: " + fixture.id);
  ids.add(fixture.id);

  for (const path of Object.keys(fixture.files)) {
    if (isAbsolute(path) || path.split(/[\\/]/).includes("..")) errors.push("Unsafe fixture file path: " + fixture.id + ":" + path);
  }
  if (!fixture.verifier_files || typeof fixture.verifier_files !== "object" || Array.isArray(fixture.verifier_files)) {
    errors.push("Missing verifier_files: " + fixture.id);
  } else {
    for (const path of Object.keys(fixture.verifier_files)) {
      if (isAbsolute(path) || path.split(/[\\/]/).includes("..")) errors.push("Unsafe verifier path: " + fixture.id + ":" + path);
      if (fixture.allowed_paths.includes(path)) errors.push("Verifier must not be allowed: " + fixture.id + ":" + path);
    }
  }

  if (!Array.isArray(fixture.verifiers) || fixture.verifiers.length < 1) {
    errors.push("Fixture needs an independent verifier: " + fixture.id);
  }
  if (fixture.mode && !["single_turn", "multi_turn", "adversarial"].includes(fixture.mode)) {
    errors.push("Invalid fixture mode: " + fixture.id);
  }
  if (fixture.mode === "multi_turn" && (!Array.isArray(fixture.turns) || fixture.turns.length < 2)) {
    errors.push("Multi-turn fixture needs at least two turns: " + fixture.id);
  }
  if (fixture.turns?.some((turn) => !turn || typeof turn.prompt !== "string" || turn.prompt.length < 10)) {
    errors.push("Invalid turn prompt: " + fixture.id);
  }
  if (fixture.mode === "adversarial" && fixture.adversarial !== true) {
    errors.push("Adversarial fixture must set adversarial=true: " + fixture.id);
  }
}

if (errors.length) {
  console.error(errors.map((error) => "- " + error).join("\n"));
  process.exit(1);
}
console.log("Validated " + (manifest.cases?.length ?? 0) + " fixture evaluation cases.");
