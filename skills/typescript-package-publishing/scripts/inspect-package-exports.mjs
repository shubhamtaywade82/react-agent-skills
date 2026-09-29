#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const packageRoot = process.argv[2] ?? process.cwd();
const packageJson = JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"));

function summarize(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(summarize);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, summarize(item)]));
  return value;
}

console.log(JSON.stringify({
  name: packageJson.name ?? null,
  version: packageJson.version ?? null,
  type: packageJson.type ?? null,
  main: packageJson.main ?? null,
  module: packageJson.module ?? null,
  types: packageJson.types ?? null,
  has_exports: Boolean(packageJson.exports),
  export_conditions: summarize(packageJson.exports ?? {})
}, null, 2));
