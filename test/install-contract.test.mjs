import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { test } from "node:test";

const root = new URL("..", import.meta.url);

test("agent installer contract is present", async () => {
  const path = new URL("bin/install", root);
  await access(path, constants.X_OK);
  const content = await readFile(path, "utf8");
  assert.match(content, /--target/);
  assert.match(content, /AGENTS\.md/);
  assert.match(content, /skills/);
});
