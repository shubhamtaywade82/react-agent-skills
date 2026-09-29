#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, join } from "node:path";

const root = resolve(process.argv[2] ?? process.cwd());

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function workspaceDirectories(pattern) {
  const normalized = pattern.replace(/\\/g, "/");
  if (!normalized.includes("*")) {
    return [resolve(root, normalized)];
  }

  const [base, suffix] = normalized.split("*");
  const parent = resolve(root, base);
  if (!existsSync(parent)) return [];
  const entries = await readdir(parent, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => resolve(parent, entry.name + suffix))
    .filter((dir) => existsSync(join(dir, "package.json")));
}

const rootPackage = await readJson(join(root, "package.json"));
let patterns = Array.isArray(rootPackage.workspaces)
  ? rootPackage.workspaces
  : rootPackage.workspaces?.packages ?? [];

if (patterns.length === 0 && existsSync(join(root, "pnpm-workspace.yaml"))) {
  const yaml = await readFile(join(root, "pnpm-workspace.yaml"), "utf8");
  patterns = [...yaml.matchAll(/^\s*-\s*['"]?([^'"]+)['"]?\s*$/gm)].map(([, value]) => value.trim());
}

const packageFiles = new Set();
for (const pattern of patterns) {
  for (const dir of await workspaceDirectories(pattern)) {
    packageFiles.add(join(dir, "package.json"));
  }
}

const names = new Map();
const failures = [];
for (const file of packageFiles) {
  const pkg = await readJson(file);
  if (!pkg.name) {
    failures.push("Workspace package has no name: " + file);
    continue;
  }
  if (names.has(pkg.name)) failures.push("Duplicate workspace package name: " + pkg.name);
  names.set(pkg.name, file);
}

const dependencySections = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];
for (const file of packageFiles) {
  const pkg = await readJson(file);
  for (const section of dependencySections) {
    for (const [name, version] of Object.entries(pkg[section] ?? {})) {
      if (typeof version === "string" && version.startsWith("workspace:") && !names.has(name)) {
        failures.push("Unknown workspace dependency: " + pkg.name + " → " + name);
      }
    }
  }
}

if (failures.length) {
  console.error(failures.map((failure) => "- " + failure).join("\n"));
  process.exit(1);
}

console.log("Validated workspace package boundaries: " + names.size + " packages.");
