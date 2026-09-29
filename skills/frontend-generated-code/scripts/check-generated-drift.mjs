#!/usr/bin/env node
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const separator = args.indexOf("--");
const repo = args[0];
const paths = separator === -1 ? args.slice(1) : args.slice(separator + 1);

if (!repo || paths.length === 0) {
  console.error("Usage: node scripts/check-generated-drift.mjs <repository-root> -- <generated-path> [...]");
  process.exit(2);
}

try {
  execFileSync("git", ["-C", repo, "diff", "--quiet", "--", ...paths], { stdio: "ignore" });
  console.log("Generated files are clean: " + paths.join(", "));
} catch (error) {
  if (error.status === 1) {
    console.error("Generated files differ: " + paths.join(", "));
    console.error("Regenerate from the authoritative source before finalizing.");
    process.exit(1);
  }
  console.error("Unable to inspect generated files with git.");
  process.exit(2);
}
