// Build the complete Agensi marketplace bundle.
//
// Produces dist/react-agent-skills-bundle-<version>.tgz and a sibling
// .manifest.json describing the contents. The bundle is a single
// archive that preserves the canonical directory layout (skills/,
// patterns/, evaluations/, benchmarks/, router/, docs/, bin/install,
// AGENTS.md, skill-manifest.yml, LICENSE, packaging/LICENSE_ADDENDUM.md,
// packaging/MARKETPLACE_LISTING.md, scripts/validate*.mjs).
//
// The bundle is byte-identical to the canonical source — the builder
// copies files, it never modifies them. The bundle contract test
// (test/bundle-contract.test.mjs) re-derives the manifest and compares.
//
// Usage:
//
//   node scripts/build-bundle.mjs --output dist/
//   node scripts/build-bundle.mjs --output dist/ --no-tar   # skip archiving
//   node scripts/build-bundle.mjs --output dist/ --stage-only  # skip archive + manifest write
//
// Exit codes:
//   0 — bundle built and (unless --stage-only) archived.
//   1 — registry or staging error.
//   2 — bad CLI usage.

import { parseArgs } from "node:util";
import { cp, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import {
  buildTimestamp,
  readBenchmarkRegistry,
  readBundleVersion,
  readEvaluationRegistry,
  readPatternRegistry,
  readSkillRegistry,
  readSourceCommit,
} from "./lib/bundle-shared.mjs";

// Resolve a repo-relative path into an absolute filesystem path.
// This script lives at scripts/build-bundle.mjs, so the repo root is one
// directory up. fileURLToPath on a URL anchored at ../ from this script.
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
  console.log(`Usage: node scripts/build-bundle.mjs --output <dir> [--no-tar] [--stage-only]

Build the complete Agensi marketplace bundle.

  --output <dir>      Where to write the .tgz and .manifest.json (default: dist).
  --no-tar            Skip the tar+gzip step; leave the staging dir in place.
  --stage-only        Skip archiving and manifest writing; leave staging dir.
  --help              Show this help.
`);
  process.exit(0);
}

// files at the repo root that ship verbatim in the bundle
const ROOT_FILES = [
  "AGENTS.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "LICENSE",
  "README.md",
  "SECURITY.md",
  "skill-manifest.yml",
];

// directories at the repo root that ship verbatim in the bundle
const ROOT_DIRS = [
  "bin",
  "router",
  "skills",
  "patterns",
  "evaluations",
  "benchmarks",
  "docs",
  "test",
];

// scripts/ ships only the validators and bundle tooling, not the
// benchmark/fixture/discovery runners (those need extra deps the
// buyer may not have). The contract tests in test/ already cover the
// bundle's structural invariants.
const SHIPPED_SCRIPTS = [
  "scripts/validate.mjs",
  "scripts/validate-benchmarks.mjs",
  "scripts/validate-fixtures.mjs",
  "scripts/skill-discovery-evaluator.mjs",
  "scripts/build-bundle.mjs",
  "scripts/build-starter-bundle.mjs",
  "scripts/lib/bundle-shared.mjs",
];

// packaging/ ships the marketplace addendum, listing, publishing guide,
// starter skills list, and bundle version. These are the buyer-facing
// documents.
const SHIPPED_PACKAGING = [
  "packaging/LICENSE_ADDENDUM.md",
  "packaging/MARKETPLACE_LISTING.md",
  "packaging/PUBLISHING.md",
  "packaging/STARTER_SKILLS.yml",
  "packaging/BUNDLE_VERSION.txt",
];

try {
  const skills = await readSkillRegistry();
  const patterns = await readPatternRegistry();
  const evaluations = await readEvaluationRegistry();
  const benchmarks = await readBenchmarkRegistry();
  const version = await readBundleVersion();
  const sourceCommit = readSourceCommit();
  const builtAt = buildTimestamp();

  const staging = await mkdtemp(path.join(tmpdir(), "ras-bundle-"));
  const stagingRoot = path.join(staging, "react-agent-skills");
  await mkdir(stagingRoot, { recursive: true });

  // Copy verbatim root files.
  for (const rel of ROOT_FILES) {
    const src = repoPath(rel);
    const dst = path.join(stagingRoot, rel);
    await mkdir(path.dirname(dst), { recursive: true });
    await cp(src, dst);
  }

  // Copy verbatim root dirs.
  for (const rel of ROOT_DIRS) {
    const src = repoPath(rel);
    const dst = path.join(stagingRoot, rel);
    await cp(src, dst, { recursive: true, force: true });
  }

  // Copy only the shipped scripts (not the entire scripts/ tree).
  for (const rel of SHIPPED_SCRIPTS) {
    const src = repoPath(rel);
    const dst = path.join(stagingRoot, rel);
    await mkdir(path.dirname(dst), { recursive: true });
    await cp(src, dst);
  }

  // Copy only the shipped packaging files.
  for (const rel of SHIPPED_PACKAGING) {
    const src = repoPath(rel);
    const dst = path.join(stagingRoot, rel);
    await mkdir(path.dirname(dst), { recursive: true });
    await cp(src, dst);
  }

  // Write the bundle manifest at the archive root.
  const bundleManifest = {
    bundle: "react-agent-skills",
    edition: "complete",
    version,
    sourceCommit,
    builtAt,
    inventory: {
      skills: skills.length,
      patterns: patterns.length,
      evaluations: evaluations.length,
      benchmarkCases: benchmarks.cases,
      benchmarkFixtures: benchmarks.fixtures,
    },
    layout: {
      rootFiles: ROOT_FILES,
      rootDirs: ROOT_DIRS,
      scripts: SHIPPED_SCRIPTS,
      packaging: SHIPPED_PACKAGING,
    },
    verification: {
      validators: [
        "node scripts/validate.mjs",
        "node scripts/validate-benchmarks.mjs",
        "node scripts/validate-fixtures.mjs",
        "node scripts/skill-discovery-evaluator.mjs --check",
      ],
      contractTests: "node --test test/*.test.mjs",
      installer: "bash bin/install --target <path>",
    },
    license: {
      file: "LICENSE",
      addendum: "packaging/LICENSE_ADDENDUM.md",
    },
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

  // Always write the manifest sidecar so the contract test and the
  // marketplace listing can read it without extracting the archive.
  const manifestPath = path.join(outputDir, `react-agent-skills-bundle-${version}.manifest.json`);
  await writeFile(manifestPath, JSON.stringify(bundleManifest, null, 2) + "\n");

  if (args.values["stage-only"] || args.values["no-tar"]) {
    console.log(`Stage directory: ${stagingRoot}`);
    console.log(`Manifest written: ${manifestPath}`);
    process.exit(0);
  }

  const archiveName = `react-agent-skills-bundle-${version}.tgz`;
  const archivePath = path.join(outputDir, archiveName);

  // Use the system tar (POSIX tar with gzip). The archive root is the
  // staging dir so paths inside the archive start with
  // `react-agent-skills/...`.
  const tarResult = spawnSync(
    "tar",
    [
      "-czf",
      archivePath,
      "-C",
      staging,
      "react-agent-skills",
    ],
    { stdio: "inherit" },
  );
  if (tarResult.status !== 0) {
    console.error("tar failed");
    process.exit(1);
  }

  await rm(staging, { recursive: true, force: true });

  console.log(`Built ${archivePath}`);
  console.log(`Manifest ${manifestPath}`);
  console.log(
    `Inventory: ${skills.length} skills, ${patterns.length} patterns, ` +
      `${evaluations.length} evaluations, ${benchmarks.cases} benchmark cases ` +
      `(${benchmarks.fixtures} fixtures).`,
  );
} catch (err) {
  console.error(err.stack || err.message);
  process.exit(1);
}
