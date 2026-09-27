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

async function validateRegistry(path, label, rootPattern) {
  const registry = await readFile(new URL(path, root), "utf8");
  const lines = registry.split(/\r?\n/);
  const entries = [];

  for (let index = 0; index < lines.length; index += 1) {
    const nameMatch = lines[index].match(rootPattern.name);
    if (!nameMatch) continue;
    const pathMatch = lines[index + 1]?.match(rootPattern.path);
    if (!pathMatch) {
      errors.push(`Missing path for ${label}: ${nameMatch[1]}`);
      continue;
    }
    entries.push({ name: nameMatch[1], path: pathMatch[1] });
    index += 1;
  }

  const registered = new Set();
  for (const entry of entries) {
    if (registered.has(entry.name)) errors.push("Duplicate " + label + ": " + entry.name);
    registered.add(entry.name);
    try {
      const content = await readFile(new URL(entry.path, root), "utf8");
      if (!content.trim()) errors.push("Empty " + label + " file: " + entry.path);
    } catch {
      errors.push("Missing " + label + " file: " + entry.path);
    }
  }

  if (!entries.length) errors.push("No " + label + " entries registered in " + path);
  return entries;
}

const patternEntries = await validateRegistry(
  "patterns/PATTERN_MANIFEST.yml",
  "pattern",
  {
    name: /^  - name: ([A-Za-z0-9-]+)$/,
    path: /^    path: (patterns\/[^\s]+)$/
  }
);

const evaluationManifest = await readFile(new URL("evaluations/manifest.yml", root), "utf8").catch(() => "");
if (evaluationManifest) {
  const lines = evaluationManifest.split(/\r?\n/);
  const evaluationEntries = [];

  for (let index = 0; index < lines.length; index += 1) {
    const id = lines[index].match(/^  - id: ([A-Za-z0-9-]+)$/);
    if (!id) continue;
    const path = lines[index + 1]?.match(/^    path: (.+)$/);
    const skill = lines[index + 2]?.match(/^    skill: ([A-Za-z0-9-]+)$/);
    if (!path || !skill) {
      errors.push("Incomplete evaluation: " + id[1]);
      continue;
    }
    evaluationEntries.push({ id: id[1], path: path[1], skill: skill[1] });
    index += 2;
  }

  const evaluationIds = new Set();
  for (const entry of evaluationEntries) {
    if (evaluationIds.has(entry.id)) errors.push("Duplicate evaluation: " + entry.id);
    evaluationIds.add(entry.id);
    if (!names.has(entry.skill)) errors.push("Unregistered skill for evaluation " + entry.id + ": " + entry.skill);

    try {
      const content = await readFile(new URL(entry.path, root), "utf8");
      for (const required of ["id:", "version:", "prompt:", "checks:"]) {
        if (!content.includes(required)) errors.push(entry.path + ": missing " + required);
      }
    } catch {
      errors.push("Missing evaluation file: " + entry.path);
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
