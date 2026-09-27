import { readdir, readFile } from "node:fs/promises";

const root = new URL("..", import.meta.url);
const errors = [];

const manifest = await readFile(new URL("skill-manifest.yml", root), "utf8");
const entries = [...manifest.matchAll(/^  - name: ([A-Za-z0-9-]+)\n    path: (skills\/[A-Za-z0-9-]+\/SKILL\.md)$/gm)]
  .map(([, name, path]) => ({ name, path }));

if (!entries.length) errors.push("No skills registered in skill-manifest.yml");

const names = new Set();
for (const entry of entries) {
  if (names.has(entry.name)) errors.push("Duplicate skill name: " + entry.name);
  names.add(entry.name);

  try {
    const content = await readFile(new URL(entry.path, root), "utf8");
    for (const required of ["---\n", "## Activate when", "## Repository inspection", "## Verification"]) {
      if (!content.includes(required)) {
        errors.push(entry.path + ": missing " + required.replaceAll("\n", ""));
      }
    }
  } catch {
    errors.push("Missing skill file: " + entry.path);
  }
}

const dirs = (await readdir(new URL("skills/", root), { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

for (const dir of dirs) {
  if (!names.has(dir)) errors.push("Unregistered skill directory: " + dir);
}

async function validateRegistry(path, entryPattern, label) {
  const registry = await readFile(new URL(path, root), "utf8");
  const registryEntries = [...registry.matchAll(entryPattern)];
  const registered = new Set();

  for (const [, name, filePath] of registryEntries) {
    if (registered.has(name)) errors.push("Duplicate " + label + ": " + name);
    registered.add(name);
    try {
      const content = await readFile(new URL(filePath, root), "utf8");
      if (!content.trim()) errors.push("Empty " + label + " file: " + filePath);
    } catch {
      errors.push("Missing " + label + " file: " + filePath);
    }
  }

  if (!registryEntries.length) errors.push("No " + label + " entries registered in " + path);
  return registryEntries;
}

const patternEntries = await validateRegistry(
  "patterns/PATTERN_MANIFEST.yml",
  /^  - name: ([A-Za-z0-9-]+)\n    path: (patterns\/[^\n]+)$/gm,
  "pattern"
);

const evaluationManifest = await readFile(new URL("evaluations/manifest.yml", root), "utf8").catch(() => "");
if (evaluationManifest) {
  const evaluationEntries = [...evaluationManifest.matchAll(
    /^  - id: ([A-Za-z0-9-]+)\n    path: ([^\n]+)\n    skill: ([A-Za-z0-9-]+)$/gm
  )];

  const evaluationIds = new Set();
  for (const [, id, path, skill] of evaluationEntries) {
    if (evaluationIds.has(id)) errors.push("Duplicate evaluation: " + id);
    evaluationIds.add(id);
    if (!names.has(skill)) errors.push("Unregistered skill for evaluation " + id + ": " + skill);

    try {
      const content = await readFile(new URL(path, root), "utf8");
      for (const required of ["id:", "version:", "prompt:", "checks:"]) {
        if (!content.includes(required)) errors.push(path + ": missing " + required);
      }
    } catch {
      errors.push("Missing evaluation file: " + path);
    }
  }

  if (!evaluationEntries.length) errors.push("No evaluations registered in evaluations/manifest.yml");
}

if (errors.length) {
  console.error(errors.map((error) => "- " + error).join("\n"));
  process.exit(1);
}

console.log(
  "Validated " + entries.length + " skills, " + patternEntries.length +
  " patterns" + (evaluationManifest ? " and evaluations." : ".")
);
