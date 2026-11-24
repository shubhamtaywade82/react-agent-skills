#!/usr/bin/env node
// bin/cross-pack-verify.mjs (v3, react-agent-skills port)
//
// Verifies the cross-pack contract declared in this pack's skill-manifest.yml.
// Equivalent checks to node-agent-skills' bin/cross-pack-verify.mjs, ported as
// a self-contained script (this pack has no lib/ parser modules):
//
//   1. `cross_pack.companions[]` entries each have `pack`, `repo`,
//      `pinned_ref`, `language`, and (if `snapshot` is set) the snapshot file
//      exists and is not stale (>90 days by default; --staleness).
//   2. Each companion snapshot's `documented_name_collisions` matches the
//      recomputed intersection of this pack's skill names and the snapshot's.
//   3. `cross_pack.seam_contracts[]` primaries exist on disk
//      (skills/<name>/SKILL.md).
//   4. (Optional, when --companions is given) each companion pack found under
//      --companions declares a symmetric seam_contract pointing back.
//
// This script is purely additive — it does not replace `npm run validate`.
//
// Usage:
//   node bin/cross-pack-verify.mjs [--root <repo-root>] [--companions <skills-root>]
//                                  [--staleness <days>]
//
// Exit codes: 0 pass, 1 checks failed, 2 invocation error.

import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function parseArgs(argv) {
  const options = { staleness: 90, root: null, companions: null };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--root") { options.root = next; i += 1; }
    else if (arg === "--companions") { options.companions = next; i += 1; }
    else if (arg === "--staleness") { options.staleness = parseInt(next, 10); i += 1; }
    else if (arg === "-h" || arg === "--help") {
      console.error(`Usage: node bin/cross-pack-verify.mjs [--root <path>] [--companions <path>] [--staleness <days>]
  --root         Repository root (default: env REACT_AGENT_SKILLS_ROOT or this script's parent)
  --companions   Skills root to scan for installed companion packs (default: skip symmetry)
  --staleness    Snapshot staleness threshold in days (default: 90)`);
      process.exit(0);
    } else {
      console.error(`unknown argument: ${arg}`);
      process.exit(2);
    }
  }
  if (!options.root) {
    options.root = process.env.REACT_AGENT_SKILLS_ROOT
      || path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  }
  return options;
}

// Parse the manifest's cross_pack section with indentation-aware line scans:
// companions and seam_contracts are lists of mappings at 4-space indent under
// their 2-space parent keys.
function parseCrossPackSection(manifestText) {
  const lines = manifestText.split("\n");
  const start = lines.findIndex((line) => line === "cross_pack:");
  if (start === -1) return null;
  const section = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^[^\s#-]/.test(line)) break; // next top-level key
    section.push(line);
  }
  const text = section.join("\n");

  const companions = [];
  let current = null;
  for (const line of text.split("\n")) {
    const entry = line.match(/^    - (\w+): (.*)$/);
    if (entry) {
      current = { [entry[1]]: entry[2].replace(/^["']|["']$/g, "") };
      companions.push(current);
      continue;
    }
    const field = line.match(/^      (\w+): (.*)$/);
    if (field && current && field[1] !== "secondary_in_this_pack") {
      current[field[1]] = field[2].replace(/^["']|["']$/g, "");
    }
  }

  const seamContracts = [];
  let seam = null;
  for (const line of text.split("\n")) {
    const entry = line.match(/^    - boundary: (.*)$/);
    if (entry) {
      seam = { boundary: entry[1].trim() };
      seamContracts.push(seam);
      continue;
    }
    const field = line.match(/^      (primary_in_this_pack|companion_pack|companion_side): (.*)$/);
    if (field && seam) {
      seam[field[1]] = field[2].trim();
    }
  }

  const nameCollisionsBlock = text.match(/^  name_collisions:\s*(\[.*\]|)\s*$/m);
  return {
    companions: companions.filter((c) => c.pack),
    seam_contracts: seamContracts,
    name_collisions_inline: nameCollisionsBlock ? nameCollisionsBlock[1] : null,
  };
}

function parseSkillNames(manifestText) {
  return [...manifestText.matchAll(/^  - name: (\S+)\s*$/gm)].map((m) => m[1]);
}

// Parse a companion snapshot: companion_repository, companion_commit,
// captured_at, skills (block list), documented_name_collisions (inline [] or
// block list), seam_owners.
function parseSnapshot(text) {
  const lines = text.split("\n");
  const get = (key) => {
    const m = text.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
    return m ? m[1].trim() : null;
  };
  const listBlock = (startLine) => {
    const items = [];
    let inList = false;
    for (const line of lines) {
      if (line.startsWith(startLine)) {
        inList = true;
        continue;
      }
      if (inList) {
        if (/^  - /.test(line)) items.push(line.slice(4).split("#")[0].trim());
        else if (/^\S/.test(line) || line.startsWith("  [A-Za-z_]")) break;
      }
    }
    return items;
  };
  const skills = listBlock("skills:");
  const inlineCollisions = get("documented_name_collisions");
  // Strip a trailing inline comment before interpreting the value.
  const collisionsValue = inlineCollisions ? inlineCollisions.split("#")[0].trim() : "";
  const documented = collisionsValue.startsWith("[")
    ? (collisionsValue.match(/[\w][\w-]*/g) ?? [])
    : listBlock("documented_name_collisions:");
  return {
    companion_repository: get("companion_repository"),
    companion_commit: get("companion_commit"),
    captured_at: get("captured_at"),
    skills,
    documented_name_collisions: documented,
  };
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
  const thisSkills = new Set(parseSkillNames(manifestText));

  if (!crossPack) {
    console.error("ERROR: no cross_pack section in skill-manifest.yml");
    process.exit(1);
  }

  for (const companion of crossPack.companions) {
    for (const field of ["pack", "repo", "pinned_ref", "language"]) {
      if (!companion[field] || !String(companion[field]).trim()) {
        errors.push(`companion ${companion.pack ?? "?"} missing required field ${field}`);
      }
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

    // Collision intersection
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
  }

  // Seam contract primaries exist on disk.
  for (const seam of crossPack.seam_contracts) {
    const primary = seam.primary_in_this_pack;
    if (!primary || !primary.trim()) {
      errors.push(`seam_contracts entry ${seam.boundary} missing primary_in_this_pack`);
      continue;
    }
    const skillPath = path.join(root, "skills", primary, "SKILL.md");
    if (!existsSync(skillPath)) {
      errors.push(`seam_contracts primary ${primary} not found at skills/${primary}/SKILL.md`);
    }
  }

  // Optional cross-pack symmetry.
  if (options.companions && existsSync(options.companions)) {
    checkCompanionSymmetry(options.companions, crossPack, errors, warnings);
  }

  if (warnings.length > 0) {
    console.error("WARNINGS:");
    for (const warning of warnings) console.error(`  - ${warning}`);
  }

  if (errors.length > 0) {
    console.error("ERRORS:");
    for (const error of errors) console.error(`  - ${error}`);
    console.error(`Cross-pack verification FAILED (${errors.length} error${errors.length === 1 ? "" : "s"}).`);
    process.exit(1);
  }

  const schemaVersionMatch = manifestText.match(/^schema_version:\s*(\d+)\s*$/m);
  console.log("Cross-pack verification PASSED.");
  console.log(`  schema_version: ${schemaVersionMatch ? schemaVersionMatch[1] : "(missing)"}`);
  console.log(`  companions:     ${crossPack.companions.length}`);
  for (const companion of crossPack.companions) {
    console.log(`    - ${companion.pack} (${companion.language}; pinned: ${companion.pinned_ref})`);
  }
  console.log(`  seam_contracts: ${crossPack.seam_contracts.length}`);
  for (const seam of crossPack.seam_contracts) {
    console.log(`    - ${seam.boundary}: this=${seam.primary_in_this_pack}, companion=${seam.companion_side}`);
  }
  process.exit(0);
}

function checkCompanionSymmetry(skillsRoot, crossPack, errors, warnings) {
  for (const companion of crossPack.companions) {
    const candidateDirs = [
      path.join(skillsRoot, companion.pack),
      path.join(skillsRoot, `.${companion.pack}`),
    ];
    let companionManifestPath = null;
    for (const dir of candidateDirs) {
      const direct = path.join(dir, "skill-manifest.yml");
      const nested = path.join(dir, `.${companion.pack}`, "skill-manifest.yml");
      if (existsSync(direct)) { companionManifestPath = direct; break; }
      if (existsSync(nested)) { companionManifestPath = nested; break; }
    }
    if (!companionManifestPath) {
      warnings.push(`companion ${companion.pack} not found under ${skillsRoot} — skipping symmetry check for this companion`);
      continue;
    }
    const companionCrossPack = parseCrossPackSection(readFileSync(companionManifestPath, "utf8"));
    if (!companionCrossPack) {
      warnings.push(`companion ${companion.pack} manifest at ${companionManifestPath} has no cross_pack section — skipping symmetry`);
      continue;
    }
    // Either side of a symmetric seam declares its own primary skill, so the
    // mirror check matches on companion_side: the companion's contract must
    // point back at THIS pack's seam skill (companions[].seam_skill).
    const mirror = companionCrossPack.seam_contracts.find(
      (seam) => seam.companion_pack === "react-agent-skills" &&
        String(seam.companion_side ?? "").includes(companion.seam_skill)
    );
    if (!mirror) {
      warnings.push(`companion ${companion.pack} does not declare a symmetric seam_contract pointing back at react-agent-skills/${companion.seam_skill} — seam routing will be one-directional`);
    }
  }
}

main().catch((err) => {
  console.error(`FATAL: ${err.stack || err.message || err}`);
  process.exit(2);
});
