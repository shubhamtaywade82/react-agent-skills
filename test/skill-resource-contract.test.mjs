import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { test } from "node:test";

const exec = promisify(execFile);
const root = new URL("..", import.meta.url);
const script = (skill, file) => new URL(`skills/${skill}/scripts/${file}`, root).pathname;

test("generated-code drift script reports clean and dirty generated paths", async () => {
  const dir = await mkdtemp(join(tmpdir(), "generated-drift-"));
  await exec("git", ["init", "-q", dir]);
  await exec("git", ["-C", dir, "config", "user.email", "test@example.com"]);
  await exec("git", ["-C", dir, "config", "user.name", "Test"]);
  await writeFile(join(dir, "generated.ts"), "export const value = 1;\n");
  await exec("git", ["-C", dir, "add", "."]);
  await exec("git", ["-C", dir, "commit", "-qm", "baseline"]);

  await exec(process.execPath, [script("frontend-generated-code", "check-generated-drift.mjs"), dir, "--", "generated.ts"]);

  await writeFile(join(dir, "generated.ts"), "export const value = 2;\n");
  await assert.rejects(
    () => exec(process.execPath, [script("frontend-generated-code", "check-generated-drift.mjs"), dir, "--", "generated.ts"]),
    /Generated files differ/
  );
});

test("package export validator accepts existing conditional targets and rejects missing targets", async () => {
  const dir = await mkdtemp(join(tmpdir(), "package-exports-"));
  await mkdir(join(dir, "dist"));
  await writeFile(join(dir, "dist/index.js"), "export {};\n");
  await writeFile(join(dir, "dist/index.d.ts"), "export {};\n");
  await writeFile(join(dir, "package.json"), JSON.stringify({
    name: "demo",
    exports: { ".": { types: "./dist/index.d.ts", import: "./dist/index.js" } }
  }));

  await exec(process.execPath, [script("typescript-package-publishing", "validate-package-exports.mjs"), dir]);
  await writeFile(join(dir, "package.json"), JSON.stringify({
    name: "demo",
    exports: { ".": { types: "./dist/missing.d.ts", import: "./dist/index.js" } }
  }));

  await assert.rejects(
    () => exec(process.execPath, [script("typescript-package-publishing", "validate-package-exports.mjs"), dir]),
    /Missing export target/
  );
});

test("workspace boundary validator rejects unknown workspace dependency names", async () => {
  const dir = await mkdtemp(join(tmpdir(), "workspace-boundaries-"));
  await mkdir(join(dir, "packages", "app"), { recursive: true });
  await mkdir(join(dir, "packages", "shared"), { recursive: true });
  await writeFile(join(dir, "package.json"), JSON.stringify({
    private: true,
    workspaces: ["packages/*"]
  }));
  await writeFile(join(dir, "packages", "app", "package.json"), JSON.stringify({
    name: "@demo/app",
    dependencies: { "@demo/shared": "workspace:*" }
  }));
  await writeFile(join(dir, "packages", "shared", "package.json"), JSON.stringify({
    name: "@demo/shared"
  }));

  await exec(process.execPath, [script("frontend-monorepo", "check-package-boundaries.mjs"), dir]);
  await writeFile(join(dir, "packages", "app", "package.json"), JSON.stringify({
    name: "@demo/app",
    dependencies: { "@demo/unknown": "workspace:*" }
  }));

  await assert.rejects(
    () => exec(process.execPath, [script("frontend-monorepo", "check-package-boundaries.mjs"), dir]),
    /Unknown workspace dependency/
  );
});
