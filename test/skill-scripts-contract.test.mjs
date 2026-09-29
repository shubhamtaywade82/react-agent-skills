import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const exec = promisify(execFile);
const root = fileURLToPath(new URL("../", import.meta.url));

test("package export inspection produces stable machine-readable output", async () => {
  const dir = await mkdtemp(join(tmpdir(), "react-skill-package-"));
  await writeFile(join(dir, "package.json"), JSON.stringify({
    name: "@example/ui",
    version: "1.0.0",
    type: "module",
    exports: {
      ".": {
        types: "./dist/index.d.ts",
        import: "./dist/index.js"
      }
    },
    sideEffects: false
  }));

  const script = join(root, "skills/typescript-package-publishing/scripts/inspect-package-exports.mjs");
  const result = await exec(process.execPath, [script, dir]);
  const parsed = JSON.parse(result.stdout);

  assert.equal(parsed.name, "@example/ui");
  assert.equal(parsed.version, "1.0.0");
  assert.equal(parsed.has_exports, true);
  assert.equal(parsed.export_conditions["."].import, "./dist/index.js");
  assert.equal(parsed.export_conditions["."].types, "./dist/index.d.ts");
});

test("diff scope checker rejects an out-of-scope changed path", async () => {
  const dir = await mkdtemp(join(tmpdir(), "react-skill-diff-"));
  await writeFile(join(dir, "package.json"), JSON.stringify({ private: true }));
  await writeFile(join(dir, "inside.ts"), "export const ok = true;\n");
  await writeFile(join(dir, "outside.ts"), "export const no = true;\n");

  const gitEnv = { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null" };
  await exec("git", ["init", "-q", dir], { env: gitEnv });
  await exec("git", ["-C", dir, "config", "user.email", "test@example.com"], { env: gitEnv });
  await exec("git", ["-C", dir, "config", "user.name", "Skill Test"], { env: gitEnv });
  await exec("git", ["-C", dir, "add", "."], { env: gitEnv });
  await exec("git", ["-C", dir, "commit", "-q", "-m", "baseline"], { env: gitEnv });

  await writeFile(join(dir, "inside.ts"), "export const ok = false;\n");
  await writeFile(join(dir, "outside.ts"), "export const no = false;\n");

  const script = join(root, "skills/frontend-codemod-migration/scripts/check-diff-scope.mjs");
  await assert.rejects(
    exec(process.execPath, [script, "--repo", dir, "--base", "HEAD", "--allowed", "inside.ts"]),
    /out-of-scope|outside allowed scope/i
  );
});
