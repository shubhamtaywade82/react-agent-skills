import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("..", import.meta.url);
const requiredSkills = [
  "agent-tool-capabilities",
  "frontend-repository-archetypes",
  "frontend-risk-classification",
  "frontend-debugging"
];

test("agent operating layer is registered", async () => {
  const manifest = await readFile(new URL("skill-manifest.yml", root), "utf8");
  for (const name of requiredSkills) {
    assert.match(manifest, new RegExp("  - name: " + name + "\\n    path: skills/" + name + "/SKILL\\.md"));
  }
});

test("agent operating layer skills contain an executable structure", async () => {
  for (const name of requiredSkills) {
    const content = await readFile(new URL("skills/" + name + "/SKILL.md", root), "utf8");
    for (const required of ["## Activate when", "## Repository inspection", "## Implementation contract", "## Failure handling", "## Review", "## Verification"]) {
      assert.ok(content.includes(required), name + " missing " + required);
    }
  }
});

test("operating model defines capability, archetype, risk and evidence layers", async () => {
  const content = await readFile(new URL("docs/AGENT_OPERATING_MODEL.md", root), "utf8");
  for (const required of ["Capability layer", "Repository layer", "Risk layer", "Domain layer", "Observed", "Inferred", "Unavailable"]) {
    assert.ok(content.includes(required), "operating model missing " + required);
  }
});
