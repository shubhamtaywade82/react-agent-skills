import { readdir, readFile } from "node:fs/promises";

const root = new URL("..", import.meta.url);
const manifest = await readFile(new URL("skill-manifest.yml", root), "utf8");
const entries = [...manifest.matchAll(/^  - name: ([A-Za-z0-9-]+)\n    path: (skills\/[A-Za-z0-9-]+\/SKILL\.md)$/gm)]
  .map(([, name, path]) => ({ name, path }));

const errors = [];
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

if (errors.length) {
  console.error(errors.map((error) => "- " + error).join("\n"));
  process.exit(1);
}

console.log("Validated " + entries.length + " skills.");
