import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("..", import.meta.url);
const repo = (p) => fileURLToPath(new URL(p, root));

const manifest = await readFile(repo("skill-manifest.yml"), "utf8");
const skillNames = new Set(
  [...manifest.matchAll(/^  - name: ([A-Za-z0-9-]+)$/gm)].map(([, name]) => name),
);

function parseCrossPackSection(text) {
  const lines = text.split("\n");
  const start = lines.findIndex((line) => /^cross_pack:\s*$/.test(line));
  if (start === -1) return null;
  const section = { companions: [], name_collisions: [], seam_contracts: [] };
  let current = null;
  let listField = null;
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^[a-z_]+:\s*$/.test(line)) break;
    const companionMatch = line.match(/^    - pack: ([A-Za-z0-9-]+)$/);
    if (companionMatch) {
      current = { pack: companionMatch[1] };
      section.companions.push(current);
      listField = null;
      continue;
    }
    const collisionMatch = line.match(/^    - skill_name: ([A-Za-z0-9-]+)$/);
    if (collisionMatch) {
      current = { skill_name: collisionMatch[1] };
      section.name_collisions.push(current);
      listField = null;
      continue;
    }
    const seamMatch = line.match(/^    - boundary: ([A-Za-z0-9-]+)$/);
    if (seamMatch) {
      current = { boundary: seamMatch[1] };
      section.seam_contracts.push(current);
      listField = null;
      continue;
    }
    const schemaMatch = line.match(/^  schema_version:\s*(\d+)\s*$/);
    if (schemaMatch) { section.schema_version = parseInt(schemaMatch[1], 10); continue; }
    const fieldMatch = line.match(/^      ([a-z_]+):\s*(.*)$/);
    if (fieldMatch && current) {
      const [, key, value] = fieldMatch;
      if (value.trim() === "") { current[key] = []; listField = key; }
      else { current[key] = value.trim(); listField = null; }
      continue;
    }
    const listItemMatch = line.match(/^        - ([A-Za-z0-9/-]+)$/);
    if (listItemMatch && current && listField) {
      current[listField].push(listItemMatch[1].trim());
      continue;
    }
  }
  return section;
}

function parseSnapshot(text) {
  const skills = [];
  const collisions = [];
  let capturedAt = null;
  let companionCommit = null;
  let mode = null;
  for (const line of text.split("\n")) {
    const captured = line.match(/^captured_at:\s+"?([^"\n]+)"?\s*$/);
    if (captured) { capturedAt = captured[1].trim(); continue; }
    const commit = line.match(/^companion_commit:\s+"?([^"\n#]+)"?(?:\s*#.*)?$/);
    if (commit) { companionCommit = commit[1].trim(); continue; }
    if (/^skills:\s*$/.test(line)) { mode = "skills"; continue; }
    if (/^documented_name_collisions:/.test(line)) {
      const inline = line.match(/^documented_name_collisions:\s*\[(.*)\]\s*$/);
      if (inline && inline[1].trim()) {
        for (const item of inline[1].split(",")) {
          if (item.trim()) collisions.push(item.trim().replace(/^["']|["']$/g, ""));
        }
      }
      mode = "collisions";
      continue;
    }
    const item = line.match(/^  - (.+)$/);
    if (item && mode === "skills" && /^[a-z0-9-]+$/.test(item[1].trim())) {
      skills.push(item[1].trim());
      continue;
    }
    if (mode === "collisions") {
      const bare = line.match(/^  - ([a-z0-9-]+)\s*$/);
      if (bare) { collisions.push(bare[1].trim()); continue; }
      const field = line.match(/^    skill_name: ([a-z0-9-]+)/);
      if (field) { collisions.push(field[1].trim()); continue; }
    }
  }
  return { skills, documented_name_collisions: collisions, captured_at: capturedAt, companion_commit: companionCommit };
}

const crossPack = parseCrossPackSection(manifest);

test("manifest declares a v3 cross-pack contract", () => {
  assert.ok(crossPack, "skill-manifest.yml must declare a cross_pack section");
  assert.equal(crossPack.schema_version, 3, "cross_pack.schema_version must be 3");
  // Guard against a missing section key: without these lines the collision
  // entries parse as extra companion list items in real YAML.
  assert.match(manifest, /^  companions:\s*$/m, "cross_pack must declare a companions: key");
  assert.match(manifest, /^  name_collisions:\s*$/m, "cross_pack must declare a name_collisions: key");
  assert.match(manifest, /^  seam_contracts:\s*$/m, "cross_pack must declare a seam_contracts: key");
  assert.ok((crossPack.companions ?? []).length >= 2, "both backend companions must be declared");
  assert.ok(
    (crossPack.companions ?? []).every((companion) => companion.repo !== undefined && companion.language !== undefined),
    "every companion entry must be a mapping (not a stray collision entry)",
  );
  const names = crossPack.companions.map((companion) => companion.pack);
  assert.ok(names.includes("ruby-agent-skills"), "ruby-agent-skills must be a declared companion");
  assert.ok(names.includes("node-agent-skills"), "node-agent-skills must be a declared companion");
});

test("each companion is pinned to a repo ref and a snapshot", () => {
  for (const companion of crossPack.companions) {
    for (const key of ["pack", "repo", "pinned_ref", "language", "snapshot"]) {
      assert.ok(companion[key] && String(companion[key]).trim(), `companion ${companion.pack}: missing ${key}`);
    }
    assert.match(companion.repo, /^https:\/\/github\.com\//, `companion ${companion.pack}: repo must be a GitHub https URL`);
    assert.ok(existsSync(repo(companion.snapshot)), `companion ${companion.pack}: snapshot file must exist at ${companion.snapshot}`);
  }
});

test("companion snapshots parse and carry capture metadata", async () => {
  for (const companion of crossPack.companions) {
    const snapshotText = await readFile(repo(companion.snapshot), "utf8");
    const snapshot = parseSnapshot(snapshotText);
    assert.ok(snapshot.skills.length > 0, `snapshot ${companion.pack} lists no skills`);
    assert.ok(snapshot.captured_at, `snapshot ${companion.pack} must carry captured_at`);
    assert.ok(snapshot.companion_commit, `snapshot ${companion.pack} must carry companion_commit`);
    const ageDays = (Date.now() - new Date(snapshot.captured_at).getTime()) / 86_400_000;
    assert.ok(ageDays <= 90, `snapshot ${companion.pack} is ${Math.floor(ageDays)} days old (staleness threshold 90)`);
  }
});

test("documented collisions match the recomputed intersection for every companion", async () => {
  for (const companion of crossPack.companions) {
    const snapshotText = await readFile(repo(companion.snapshot), "utf8");
    const snapshot = parseSnapshot(snapshotText);
    const companionSkills = new Set(snapshot.skills);
    const intersection = [...skillNames].filter((name) => companionSkills.has(name)).sort();
    const documented = [...new Set(snapshot.documented_name_collisions)].sort();
    assert.deepEqual(
      documented,
      intersection,
      `snapshot ${companion.pack} documented_name_collisions must equal the recomputed intersection`,
    );
    const manifestSide = crossPack.name_collisions
      .filter((entry) => entry.companion_pack === companion.pack)
      .map((entry) => entry.skill_name)
      .sort();
    assert.deepEqual(
      manifestSide,
      intersection,
      `cross_pack.name_collisions for ${companion.pack} must cover the same intersection`,
    );
  }
});

test("name collision resolutions are known and owners exist", () => {
  const RESOLUTIONS = ["this_pack_wins", "companion_wins", "context_dependent", "split_by_language"];
  for (const entry of crossPack.name_collisions) {
    assert.ok(RESOLUTIONS.includes(entry.resolution), `collision ${entry.skill_name}: unknown resolution ${entry.resolution}`);
    assert.ok(skillNames.has(entry.skill_name), `collision ${entry.skill_name}: not a registered skill in this pack`);
    assert.ok(existsSync(repo(`skills/${entry.skill_name}/SKILL.md`)), `collision ${entry.skill_name}: missing SKILL.md`);
  }
});

test("seam contracts point at registered primaries and companion skills", () => {
  assert.ok((crossPack.seam_contracts ?? []).length >= 2, "both backend seams must be declared");
  for (const seam of crossPack.seam_contracts) {
    for (const key of ["boundary", "primary_in_this_pack", "companion_pack", "companion_side"]) {
      assert.ok(seam[key] && String(seam[key]).trim(), `seam ${seam.boundary}: missing ${key}`);
    }
    assert.ok(skillNames.has(seam.primary_in_this_pack), `seam ${seam.boundary}: primary ${seam.primary_in_this_pack} is not registered`);
    assert.match(seam.companion_side, /^[a-z0-9-]+\/skills\/[a-z0-9-]+$/, `seam ${seam.boundary}: companion_side must use the <pack>/skills/<name> form`);
    assert.ok(
      crossPack.companions.some((companion) => companion.pack === seam.companion_pack),
      `seam ${seam.boundary}: companion_pack ${seam.companion_pack} is not declared`,
    );
  }
});

test("bin/cross-pack-verify.mjs exists and passes from a clean run", () => {
  const verifier = repo("bin/cross-pack-verify.mjs");
  assert.ok(existsSync(verifier), "bin/cross-pack-verify.mjs must exist");
  const output = execFileSync(process.execPath, [verifier], { encoding: "utf8", cwd: path.dirname(verifier) + "/.." });
  assert.match(output, /Cross-pack verification PASSED\./);
});
