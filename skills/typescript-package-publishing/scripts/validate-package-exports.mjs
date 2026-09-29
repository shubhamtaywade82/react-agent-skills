#!/usr/bin/env node
import { access, readFile } from "node:fs/promises";
import { resolve, relative, isAbsolute, join } from "node:path";

const packageRoot = resolve(process.argv[2] ?? process.cwd());

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function targets(value, output = []) {
  if (typeof value === "string") {
    if (value.startsWith("./")) output.push(value);
    return output;
  }
  if (Array.isArray(value)) {
    for (const item of value) targets(item, output);
    return output;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) targets(item, output);
  }
  return output;
}

const packageJson = JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"));
if (!packageJson.exports) {
  console.log("No exports map present; nothing to validate.");
  process.exit(0);
}

const failures = [];
for (const target of targets(packageJson.exports)) {
  if (target.includes("*")) {
    const parent = target.slice(0, target.indexOf("*"));
    if (!parent.startsWith("./") || !(await exists(resolve(packageRoot, parent)))) {
      failures.push("Missing export pattern base: " + target);
    }
    continue;
  }

  const destination = resolve(packageRoot, target);
  const rel = relative(packageRoot, destination);
  if (isAbsolute(rel) || rel.startsWith("..")) {
    failures.push("Export target escapes package root: " + target);
    continue;
  }
  if (!(await exists(destination))) failures.push("Missing export target: " + target);
}

if (failures.length) {
  console.error(failures.map((failure) => "- " + failure).join("\n"));
  process.exit(1);
}

console.log("Validated package exports for " + packageJson.name);
