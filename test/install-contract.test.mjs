import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("..", import.meta.url);

test("agent installer contract is present", async () => {
  const path = new URL("bin/install", root);
  await access(path);
  const content = await readFile(path, "utf8");
  assert.ok(content.startsWith("#!/usr/bin/env bash"));
  assert.match(content, /--target/);
  assert.match(content, /AGENTS\.md/);
  assert.match(content, /skills/);
});
