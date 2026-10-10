// Build the free starter bundle for Agensi marketplace discovery.
//
// The starter bundle is a strict subset of the complete bundle. It
// ships only the skills listed in packaging/STARTER_SKILLS.yml, plus
// the supporting files those skills need (skill-local references/ and
// scripts/), plus the always-on docs (AGENTS.md, README.md, LICENSE,
// bin/install, packaging/LICENSE_ADDENDUM.md, packaging/STARTER_SKILLS.yml).
//
// It does NOT ship:
//   - evaluations/
//   - benchmarks/
//   - patterns/ (patterns are pulled in only if a starter skill's
//     references/ cites them; the starter skills are intentionally
//     self-contained, so none should)
//
// The starter bundle's purpose is discovery and evaluation; it is not
// a substitute for the complete bundle.
//
// Usage:
//
//   node scripts/build-starter-bundle.mjs --output dist/
//   node scripts/build-starter-bundle.mjs --output dist/ --no-tar
//   node scripts/build-starter-bundle.mjs --output dist/ --stage-only

import { parseArgs } from "node:util";
import { cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import {
  buildTimestamp,
  readBundleVersion,
  readSkillRegistry,
  readSourceCommit,
  readStarterSkillList,
} from "./lib/bundle-shared.mjs";

// This script lives at scripts/build-starter-bundle.mjs, so the repo
// root is one directory up.
function repoPath(rel) {
  return fileURLToPath(new URL("../" + rel, import.meta.url));
}

const args = parseArgs({
  options: {
    output: { type: "string", default: "dist" },
    "no-tar": { type: "boolean", default: false },
    "stage-only": { type: "boolean", default: false },
    help: { type: "boolean", default: false },
  },
  strict: true,
  allowPositionals: false,
});

if (args.values.help) {
  console.log(`Usage: node scripts/build-starter-bundle.mjs --output <dir> [--no-tar] [--stage-only]

Build the free starter bundle.

  --output <dir>      Where to write the .tgz and .manifest.json (default: dist).
  --no-tar            Skip the tar+gzip step; leave the staging dir in place.
  --stage-only        Skip archiving and manifest writing; leave staging dir.
  --help              Show this help.
`);
  process.exit(0);
}

const ROOT_FILES = [
  "AGENTS.md",
  "CONTRIBUTING.md",
  "LICENSE",
  "README.md",
  "SECURITY.md",
];

const SHIPPED_SCRIPTS = [
  "scripts/validate.mjs",
  "scripts/build-starter-bundle.mjs",
  "scripts/lib/bundle-shared.mjs",
];

const SHIPPED_PACKAGING = [
  "packaging/LICENSE_ADDENDUM.md",
  "packaging/MARKETPLACE_LISTING.md",
  "packaging/STARTER_SKILLS.yml",
  "packaging/BUNDLE_VERSION.txt",
];

/**
 * Copy a skill directory from the repo into the staging directory,
 * preserving the SKILL.md, references/, and scripts/ subdirectories.
 * The starter bundle ships the same per-skill layout as the complete
 * bundle so buyers can upgrade without changing their integration.
 */
async function copySkill(stagingRoot, skillName) {
  const src = repoPath(`skills/${skillName}`);
  const dst = path.join(stagingRoot, "skills", skillName);
  await mkdir(path.dirname(dst), { recursive: true });
  await cp(src, dst, { recursive: true, force: true });

  // Sanity check: every starter skill must have a SKILL.md. The
  // complete validator already enforces this for the full registry,
  // but the starter list could in principle name a directory that does
  // not exist; fail loudly here so the contract test catches it.
  try {
    await readFile(path.join(dst, "SKILL.md"), "utf8");
  } catch {
    throw new Error(`starter skill ${skillName} has no SKILL.md`);
  }
}

/**
 * Copy the router/ files needed by the starter bundle. The starter
 * bundle does not need the full router/ tree; we ship only the files
 * that document routing policy (so buyers understand what they're
 * getting) and skip the per-skill routing metadata (which the starter
 * bundle does not have).
 *
 * In practice we ship the two router docs verbatim. The router is a
 * compatibility layer, not a required runtime dependency.
 */
async function copyRouterDocs(stagingRoot) {
  const files = ["ROUTING.md", "ROUTING_POLICY.yml"];
  const srcDir = repoPath("router");
  const dstDir = path.join(stagingRoot, "router");
  await mkdir(dstDir, { recursive: true });
  for (const file of files) {
    await cp(path.join(srcDir, file), path.join(dstDir, file), { force: true });
  }
}

/**
 * Copy the docs/ files that the starter bundle needs. The starter
 * bundle ships a small subset of docs/ to keep the archive small:
 *   - AGENT_INTEGRATION.md (how to install the bundle into an agent)
 *   - AGENT_SKILLS_OPTIMIZATION.md (progressive disclosure model)
 *   - AGENT_OPERATING_MODEL.md (the operating loop)
 *
 * Other docs reference skills/patterns/evals the starter bundle does
 * not ship, so we omit them.
 */
async function copyDocsSubset(stagingRoot) {
  const shipped = [
    "AGENT_INTEGRATION.md",
    "AGENT_SKILLS_OPTIMIZATION.md",
    "AGENT_OPERATING_MODEL.md",
  ];
  const srcDir = repoPath("docs");
  const dstDir = path.join(stagingRoot, "docs");
  await mkdir(dstDir, { recursive: true });
  for (const file of shipped) {
    await cp(path.join(srcDir, file), path.join(dstDir, file), { force: true });
  }
}

try {
  const allSkills = await readSkillRegistry();
  const allSkillNames = new Set(allSkills.map((s) => s.name));
  const starterNames = await readStarterSkillList();

  // Reject starter-list entries that are not in the canonical skill
  // manifest. The starter bundle must be a subset; a stale entry
  // points at a skill that was renamed or removed.
  for (const name of starterNames) {
    if (!allSkillNames.has(name)) {
      throw new Error(
        `packaging/STARTER_SKILLS.yml references unknown skill ${name}; ` +
          `update the file or restore the skill in skill-manifest.yml`,
      );
    }
  }

  const version = await readBundleVersion();
  const sourceCommit = readSourceCommit();
  const builtAt = buildTimestamp();

  const staging = await mkdtemp(path.join(tmpdir(), "ras-starter-"));
  const stagingRoot = path.join(staging, "react-agent-skills");
  await mkdir(stagingRoot, { recursive: true });

  for (const rel of ROOT_FILES) {
    const dst = path.join(stagingRoot, rel);
    await cp(repoPath(rel), dst);
  }

  for (const name of starterNames) {
    await copySkill(stagingRoot, name);
  }

  await copyRouterDocs(stagingRoot);
  await copyDocsSubset(stagingRoot);

  // bin/install ships verbatim so the starter bundle and the complete
  // bundle install identically.
  await mkdir(path.join(stagingRoot, "bin"), { recursive: true });
  await cp(repoPath("bin/install"), path.join(stagingRoot, "bin/install"));

  // Ship only the validators and bundle tooling the starter buyer needs.
  for (const rel of SHIPPED_SCRIPTS) {
    const dst = path.join(stagingRoot, rel);
    await mkdir(path.dirname(dst), { recursive: true });
    await cp(repoPath(rel), dst);
  }

  for (const rel of SHIPPED_PACKAGING) {
    const dst = path.join(stagingRoot, rel);
    await mkdir(path.dirname(dst), { recursive: true });
    await cp(repoPath(rel), dst);
  }

  // The starter bundle ships a skill-manifest.yml that contains ONLY
  // the starter skills, so the validator inside the bundle does not
  // report "Unregistered skill directory" for skills that the bundle
  // intentionally omits. We rebuild the manifest from the canonical
  // registry, filtered to the starter set, preserving triggers and
  // ordering.
  const canonicalManifest = await readFile(repoPath("skill-manifest.yml"), "utf8");
  const wanted = new Set(starterNames);
  const filteredLines = [];
  let currentName = null;
  let currentBlock = null;
  for (const line of canonicalManifest.split(/\r?\n/)) {
    const m = line.match(/^  - name: ([A-Za-z0-9-]+)$/);
    if (m) {
      if (currentBlock && wanted.has(currentName)) filteredLines.push(...currentBlock);
      currentName = m[1];
      currentBlock = [line];
      continue;
    }
    if (currentBlock) currentBlock.push(line);
  }
  if (currentBlock && wanted.has(currentName)) filteredLines.push(...currentBlock);

  const filteredManifest =
    canonicalManifest.split(/\r?\n/).slice(0, 4).join("\n") + "\n" +
    filteredLines.join("\n").replace(/\n+$/, "\n");
  // The first 4 lines of the canonical manifest are the version, name,
  // description, and "skills:" header — we preserve those verbatim.

  await writeFile(
    path.join(stagingRoot, "skill-manifest.yml"),
    filteredManifest,
  );

  // Write the bundle manifest at the archive root.
  const bundleManifest = {
    bundle: "react-agent-skills",
    edition: "starter",
    version,
    sourceCommit,
    builtAt,
    inventory: {
      skills: starterNames.length,
      // Starter bundle intentionally ships no patterns, evaluations,
      // or benchmarks. Buyers who need them must upgrade to the
      // complete bundle.
      patterns: 0,
      evaluations: 0,
      benchmarkCases: 0,
      benchmarkFixtures: 0,
    },
    skills: starterNames,
    layout: {
      rootFiles: ROOT_FILES,
      shippedScripts: SHIPPED_SCRIPTS,
      shippedPackaging: SHIPPED_PACKAGING,
    },
    verification: {
      validator: "node scripts/validate.mjs",
      installer: "bash bin/install --target <path>",
    },
    license: {
      file: "LICENSE",
      addendum: "packaging/LICENSE_ADDENDUM.md",
    },
    upgradeNote:
      "This is a strict subset of the complete bundle. To upgrade, " +
      "install the complete bundle from the Agensi marketplace listing.",
  };

  await writeFile(
    path.join(stagingRoot, "BUNDLE_MANIFEST.json"),
    JSON.stringify(bundleManifest, null, 2) + "\n",
  );

  const outputDir = path.resolve(args.values.output);
  await mkdir(outputDir, { recursive: true });

  const keepStage = args.values["stage-only"] || args.values["no-tar"];
  if (keepStage) {
    // Surface the staging path in the sidecar manifest so the
    // contract test can inspect the staged tree without extracting a
    // .tgz archive.
    bundleManifest.stagePath = stagingRoot;
  }

  const manifestPath = path.join(
    outputDir,
    `react-agent-skills-starter-${version}.manifest.json`,
  );
  await writeFile(manifestPath, JSON.stringify(bundleManifest, null, 2) + "\n");

  if (args.values["stage-only"] || args.values["no-tar"]) {
    console.log(`Stage directory: ${stagingRoot}`);
    console.log(`Manifest written: ${manifestPath}`);
    process.exit(0);
  }

  const archiveName = `react-agent-skills-starter-${version}.tgz`;
  const archivePath = path.join(outputDir, archiveName);

  const tarResult = spawnSync(
    "tar",
    ["-czf", archivePath, "-C", staging, "react-agent-skills"],
    { stdio: "inherit" },
  );
  if (tarResult.status !== 0) {
    console.error("tar failed");
    process.exit(1);
  }

  await rm(staging, { recursive: true, force: true });

  console.log(`Built ${archivePath}`);
  console.log(`Manifest ${manifestPath}`);
  console.log(`Inventory: ${starterNames.length} skills (starter subset).`);
} catch (err) {
  console.error(err.stack || err.message);
  process.exit(1);
}
