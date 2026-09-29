#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const argValue = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

const repo = resolve(argValue("--repo") ?? process.cwd());
const base = argValue("--base") ?? "HEAD";
const allowed = [];
for (let index = 0; index < args.length; index += 1) {
  if (args[index] === "--allowed" && args[index + 1]) allowed.push(args[index + 1]);
}

if (!allowed.length) {
  console.error("Usage: check-diff-scope.mjs --repo PATH --base REF --allowed PATH...");
  process.exit(2);
}

function gitNames(extra) {
  return execFileSync("git", ["-C", repo, ...extra], { encoding: "utf8" })
    .split(/\r?\n/).map((name) => name.trim()).filter(Boolean);
}

const changed = new Set([
  ...gitNames(["diff", "--name-only", base]),
  ...gitNames(["diff", "--name-only", "--cached", base])
]);

function matches(file, pattern) {
  if (pattern.endsWith("/**")) return file.startsWith(pattern.slice(0, -2));
  if (!pattern.includes("*")) return file === pattern;
  const prefix = pattern.split("*")[0];
  const suffix = pattern.split("*").slice(1).join("*");
  return file.startsWith(prefix) && (suffix === "" || file.endsWith(suffix));
}

const outOfScope = [...changed].filter((file) => !allowed.some((pattern) => matches(file, pattern)));
if (outOfScope.length) {
  console.error("Changed paths outside allowed scope:");
  for (const file of outOfScope) console.error("- " + file);
  process.exit(1);
}

console.log("All changed paths are within the allowed scope.");
