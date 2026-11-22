#!/usr/bin/env node
// bin/cross-pack-verify.mjs (v3, additive)
//
// Verifies the cross-pack contract declared in this pack's skill-manifest.yml.
// This is the react-agent-skills counterpart of ruby-agent-skills'
// bin/cross-pack-verify and node-agent-skills' bin/cross-pack-verify.mjs.
//
// Checks:
//
//   1. skill-manifest.yml declares a `cross_pack:` section with
//      schema_version 3.
//   2. `cross_pack.companions[]` entries each have `pack`, `repo`,
//      `pinned_ref`, `language`, and `snapshot`; the snapshot file exists,
//      parses, and is not stale (>90 days by default; --staleness).
//   3. Each companion snapshot's `documented_name_collisions` AND the
//      manifest's own `cross_pack.name_collisions` both match the
//      recomputed intersection of this pack's skill names and the
//      snapshot's skills list.
//   4. `cross_pack.seam_contracts[]` entries have `boundary`,
//      `primary_in_this_pack`, `companion_pack`, `companion_side`; the
//      primary exists at skills/<name>/SKILL.md and the companion side
//      uses the <pack>/skills/<name> form.
//
// This script is purely additive — it does not replace scripts/validate.mjs.
// Run after scripts/validate.mjs for full coverage.
//
// Usage:
//   node bin/cross-pack-verify.mjs [--root <repo-root>] [--staleness <days>]
//
// Exit codes: 0 pass, 1 checks failed, 2 invocation error.

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const COLLISION_RESOLUTIONS = [
  "this_pack_wins",
  "companion_wins",
  "context_dependent",
  "split_by_language",
];

function parseArgs(argv) {
  const options = { staleness: 90, root: null };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--root") { options.root = next; i += 1; }
    else if (arg === "--staleness") { options.staleness = parseInt(next, 10); i += 1; }
    else if (arg === "-h" || arg === "--help") {
      console.error(`Usage: node bin/cross-pack-verify.mjs [--root <path>] [--staleness <days>]
  --root       Repository root (default: this script's parent directory)
  --staleness  Snapshot staleness threshold in days (default: 90)`);
      process.exit(0);
    } else {
      console.error(`unknown argument: ${arg}`);
      process.exit(2);
    }
  }
  if (!options.root) {
    options.root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  }
  return options;
}

/** Parse the `skills:` list of the manifest (fixed 2-space shape). */
function parseSkillEntries(text) {
  return [...text.matchAll(/^  - name: ([A-Za-z0-9-]+)\n    path: (skills\/[A-Za-z0-9-]+\/SKILL\.md)$/gm)]
    .map(([, name]) => name);
}

/** Parse the cross_pack section (companions, name_collisions, seam_contracts). */
function parseCrossPackSection(text) {
  const lines = text.split("\n");
  const start = lines.findIndex((line) => /^cross_pack:\s*$/.test(line));
  if (start === -1) return null;
  const section = { companions: [], name_collisions: [], seam_contracts: [] };
  let mode = null;
  let current = null;
  let listField = null;
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^[a-z_]+:\s*$/.test(line)) break; // next top-level section
    const companionMatch = line.match(/^    - pack: ([A-Za-z0-9-]+)$/);
    if (companionMatch) {
      current = { pack: companionMatch[1] };
      section.companions.push(current);
      mode = "companion"; listField = null;
      continue;
    }
    const collisionMatch = line.match(/^    - skill_name: ([A-Za-z0-9-]+)$/);
    if (collisionMatch) {
      current = { skill_name: collisionMatch[1] };
      section.name_collisions.push(current);
      mode = "collision"; listField = null;
      continue;
    }
    const seamMatch = line.match(/^    - boundary: ([A-Za-z0-9-]+)$/);
    if (seamMatch) {
      current = { boundary: seamMatch[1] };
      section.seam_contracts.push(current);
      mode = "seam"; listField = null;
      continue;
    }
    const schemaMatch = line.match(/^  schema_version:\s*(\d+)\s*$/);
    if (schemaMatch) { section.schema_version = parseInt(schemaMatch[1], 10); continue; }
    const fieldMatch = line.match(/^      ([a-z_]+):\s*(.*)$/);
    if (fieldMatch && current) {
      const [, key, value] = fieldMatch;
      if (value.trim() === "") {
        if (key === "secondary_in_this_pack") { current[key] = []; listField = key; }
        else { current[key] = []; listField = key; }
      } else {
        current[key] = value.trim();
        listField = null;
      }
      continue;
    }
    const listItemMatch = line.match(/^        - ([A-Za-z0-9/-]+)$/);
    if (listItemMatch && current && listField) {
      current[listField].push(listItemMatch[1].trim());
      continue;
    }
    const subFieldMatch = line.match(/^        ([a-z_]+):\s*(.*)$/);
    if (subFieldMatch && current) {
      current[subFieldMatch[1]] = subFieldMatch[2].trim();
      continue;
    }
  }
  return section;
}

/** Parse a companion snapshot (skills, collisions, captured_at, companion_commit). */
function parseSnapshot(text) {
  const skills = [];
  const collisions = [];
  let capturedAt = null;
  let companionCommit = null;
  let mode = null;
  for (const line of text.split("\n")) {
    const capturedMatch = line.match(/^captured_at:\s+"?([^"\n]+)"?\s*$/);
    if (capturedMatch) { capturedAt = capturedMatch[1].trim(); continue; }
    const commitMatch = line.match(/^companion_commit:\s+"?([^"\n#]+)"?(?:\s*#.*)?$/);
    if (commitMatch) { companionCommit = commitMatch[1].trim(); continue; }
    if (/^skills:\s*$/.test(line)) { mode = "skills"; continue; }
    if (/^documented_name_collisions:/.test(line)) {
      const inlineMatch = line.match(/^documented_name_collisions:\s*\[(.*)\]\s*$/);
      if (inlineMatch && inlineMatch[1].trim()) {
        for (const item of inlineMatch[1].split(",")) {
          if (item.trim()) collisions.push(item.trim().replace(/^["']|["']$/g, ""));
        }
      }
      mode = "collisions";
      continue;
    }
    const itemMatch = line.match(/^  - (.+)$/);
    if (itemMatch && mode === "skills") {
      const value = itemMatch[1].trim();
      if (/^[a-z0-9-]+$/.test(value)) skills.push(value);
      continue;
    }
    if (mode === "collisions") {
      const bareMatch = line.match(/^  - ([a-z0-9-]+)\s*$/);
      if (bareMatch) { collisions.push(bareMatch[1].trim()); continue; }
      const fieldMatch = line.match(/^    skill_name: ([a-z0-9-]+)/);
      if (fieldMatch) { collisions.push(fieldMatch[1].trim()); continue; }
    }
  }
  return { skills, documented_name_collisions: collisions, captured_at: capturedAt, companion_commit: companionCommit };
}

async function main() {
  const options = parseArgs(process.argv);
  const root = options.root;
  const manifestPath = path.join(root, "skill-manifest.yml");

  if (!existsSync(manifestPath)) {
    console.error(`ERROR: manifest not found at ${manifestPath}`);
    process.exit(2);
  }

  const manifestText = await readFile(manifestPath, "utf8");
  const errors = [];
  const warnings = [];

  const crossPack = parseCrossPackSection(manifestText);
  const thisSkills = new Set(parseSkillEntries(manifestText));

  if (!crossPack) {
    errors.push("skill-manifest.yml has no cross_pack section — the v3 companion contract is missing");
    report(errors, warnings);
    process.exit(1);
  }
  if (crossPack.schema_version !== 3) {
    errors.push(`cross_pack.schema_version must be 3 (found: ${crossPack.schema_version ?? "missing"})`);
  }

  const manifestCollisions = crossPack.name_collisions ?? [];

  for (const companion of crossPack.companions ?? []) {
    for (const key of ["pack", "repo", "pinned_ref", "language"]) {
      if (!companion[key] || !String(companion[key]).trim()) {
        errors.push(`companion ${companion.pack ?? "<unknown>"}: missing ${key}`);
      }
    }
    if (companion.repo && !String(companion.repo).startsWith("https://")) {
      errors.push(`companion ${companion.pack}: repo must be an https URL`);
    }
    if (!companion.snapshot || !companion.snapshot.trim()) {
      warnings.push(`companion ${companion.pack} has no snapshot file declared — collision check skipped`);
      continue;
    }
    const snapshotPath = path.join(root, companion.snapshot);
    if (!existsSync(snapshotPath)) {
      errors.push(`companion ${companion.pack} snapshot file missing: ${companion.snapshot}`);
      continue;
    }
    const snapshot = parseSnapshot(await readFile(snapshotPath, "utf8"));

    if (snapshot.skills.length === 0) {
      errors.push(`companion ${companion.pack} snapshot lists no skills`);
    }
    if (!snapshot.companion_commit) {
      warnings.push(`companion ${companion.pack} snapshot has no companion_commit`);
    }

    // Freshness
    if (snapshot.captured_at) {
      const capturedDate = new Date(snapshot.captured_at);
      if (!Number.isNaN(capturedDate.getTime())) {
        const ageDays = Math.floor((Date.now() - capturedDate.getTime()) / 86_400_000);
        if (ageDays > options.staleness) {
          warnings.push(`companion ${companion.pack} snapshot is ${ageDays} days old (>${options.staleness}); refresh the snapshot file`);
        }
      } else {
        warnings.push(`companion ${companion.pack} snapshot captured_at unparseable: ${snapshot.captured_at}`);
      }
    } else {
      warnings.push(`companion ${companion.pack} snapshot has no captured_at date`);
    }

    // Collision intersection vs snapshot registry
    const companionSkills = new Set(snapshot.skills);
    const actualIntersection = [...thisSkills].filter((name) => companionSkills.has(name)).sort();
    const documented = [...new Set(snapshot.documented_name_collisions)].sort();
    const missingCollisions = actualIntersection.filter((name) => !documented.includes(name));
    const staleCollisions = documented.filter((name) => !actualIntersection.includes(name));
    if (missingCollisions.length > 0) {
      errors.push(`companion ${companion.pack} snapshot documented_name_collisions missing ${JSON.stringify(missingCollisions)} — actual intersection is larger than the registry`);
    }
    if (staleCollisions.length > 0) {
      errors.push(`companion ${companion.pack} snapshot documented_name_collisions has stale ${JSON.stringify(staleCollisions)} — registry lists names that no longer collide`);
    }

    // Manifest name_collisions must cover the same intersection for this companion
    if (companion.pack) {
      const manifestNames = manifestCollisions
        .filter((entry) => entry.companion_pack === companion.pack)
        .map((entry) => entry.skill_name)
        .sort();
      const manifestMissing = actualIntersection.filter((name) => !manifestNames.includes(name));
      const manifestStale = manifestNames.filter((name) => !actualIntersection.includes(name));
      if (manifestMissing.length > 0) {
        errors.push(`cross_pack.name_collisions missing ${JSON.stringify(manifestMissing)} for companion ${companion.pack}`);
      }
      if (manifestStale.length > 0) {
        errors.push(`cross_pack.name_collisions has stale ${JSON.stringify(manifestStale)} for companion ${companion.pack}`);
      }
    }
  }

  for (const collision of manifestCollisions) {
    for (const key of ["skill_name", "companion_pack"]) {
      if (!collision[key] || !String(collision[key]).trim()) {
        errors.push(`name_collision ${collision.skill_name ?? "<unknown>"}: missing ${key}`);
      }
    }
    if (collision.resolution && !COLLISION_RESOLUTIONS.includes(collision.resolution)) {
      errors.push(`name_collision ${collision.skill_name}: resolution "${collision.resolution}" must be one of ${COLLISION_RESOLUTIONS.join(", ")}`);
    }
    if (collision.companion_pack && !crossPack.companions?.some((c) => c.pack === collision.companion_pack)) {
      errors.push(`name_collision ${collision.skill_name}: companion_pack ${collision.companion_pack} is not a declared companion`);
    }
  }

  for (const seam of crossPack.seam_contracts ?? []) {
    for (const key of ["boundary", "primary_in_this_pack", "companion_pack", "companion_side"]) {
      if (!seam[key] || !String(seam[key]).trim()) {
        errors.push(`seam_contract ${seam.boundary ?? "<unknown>"}: missing ${key}`);
      }
    }
    if (seam.primary_in_this_pack && !thisSkills.has(seam.primary_in_this_pack)) {
      errors.push(`seam_contract ${seam.boundary}: primary_in_this_pack "${seam.primary_in_this_pack}" is not a registered skill`);
    }
    if (seam.companion_side && !/^[a-z0-9-]+\/skills\/[a-z0-9-]+$/.test(seam.companion_side)) {
      errors.push(`seam_contract ${seam.boundary}: companion_side "${seam.companion_side}" must use the <pack>/skills/<name> form`);
    }
    if (seam.companion_pack && !crossPack.companions?.some((c) => c.pack === seam.companion_pack)) {
      errors.push(`seam_contract ${seam.boundary}: companion_pack ${seam.companion_pack} is not a declared companion`);
    }
  }

  if ((crossPack.seam_contracts ?? []).length === 0) {
    warnings.push("cross_pack.seam_contracts is empty — no cross-stack boundaries declared");
  }

  report(errors, warnings, crossPack);
  process.exit(errors.length > 0 ? 1 : 0);
}

function report(errors, warnings, crossPack) {
  if (warnings.length > 0) {
    console.error("WARNINGS:");
    for (const warning of warnings) console.error(`  - ${warning}`);
  }
  if (errors.length > 0) {
    console.error("ERRORS:");
    for (const error of errors) console.error(`  - ${error}`);
    console.error(`Cross-pack verification FAILED (${errors.length} error${errors.length === 1 ? "" : "s"}).`);
    return;
  }
  console.log("Cross-pack verification PASSED.");
  console.log("  pack:           react-agent-skills");
  if (crossPack) {
    console.log(`  companions:     ${(crossPack.companions ?? []).length}`);
    for (const companion of crossPack.companions ?? []) {
      console.log(`    - ${companion.pack} (${companion.language}; pinned: ${companion.pinned_ref})`);
    }
    console.log(`  name_collisions: ${(crossPack.name_collisions ?? []).length}`);
    console.log(`  seam_contracts: ${(crossPack.seam_contracts ?? []).length}`);
    for (const seam of crossPack.seam_contracts ?? []) {
      console.log(`    - ${seam.boundary}: this=${seam.primary_in_this_pack}, companion=${seam.companion_side}`);
    }
  }
}

main().catch((err) => {
  console.error(`FATAL: ${err.stack || err.message || err}`);
  process.exit(2);
});
