import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("..", import.meta.url);
const skills = ["react-19-modern-apis","react-actions-forms","react-compiler","react-server-security"];

test("modern React skills are registered", async () => {
  const manifest = await readFile(new URL("skill-manifest.yml", root), "utf8");
  for (const skill of skills) assert.match(manifest, new RegExp("  - name: " + skill));
});

test("modern React skills expose operational lifecycle sections", async () => {
  for (const skill of skills) {
    const content = await readFile(new URL("skills/" + skill + "/SKILL.md", root), "utf8");
    for (const required of ["## Activate when","## Repository inspection","## Decision rules","## Implementation contract","## Failure handling","## Review","## Verification"]) {
      assert.ok(content.includes(required), skill + " missing " + required);
    }
  }
});

test("modern React evaluation contracts exist", async () => {
  const manifest = await readFile(new URL("evaluations/manifest.yml", root), "utf8");
  for (const id of ["react-19-modern-apis-contract","react-actions-forms-contract","react-compiler-contract","react-server-security-contract"]) {
    assert.match(manifest, new RegExp("  - id: " + id));
  }
});
