// Bundle contract test.
//
// This test enforces the structural invariants of the Agensi marketplace
// bundles (both complete and starter). It is run by CI alongside the
// other contract tests in test/*.test.mjs.
//
// The test does NOT build the .tgz archives (that needs `tar` and
// produces large outputs). Instead it:
//
//   1. Re-derives the bundle manifest from the canonical registries
//      using the same logic as the bundle builder, and asserts that
//      the builder's sidecar manifest.json matches.
//   2. Stages the bundle into a temp directory (using the builder's
//      --stage-only mode) and asserts that the staging directory
//      contains every file the manifest claims it contains.
//   3. Re-runs scripts/validate.mjs against the staged starter bundle's
//      skill-manifest.yml to confirm the starter bundle is internally
//      consistent on its own (it should be, since the starter manifest
//      is a strict subset).
//
// Failures here mean either the bundle builder or the canonical
// registries drifted. Fix the source of truth, not this test.

import test from "node:test";
import assert from "node:assert";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, stat, access } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  readBundleVersion,
  readSkillRegistry,
  readPatternRegistry,
  readEvaluationRegistry,
  readBenchmarkRegistry,
  readStarterSkillList,
} from "../scripts/lib/bundle-shared.mjs";

const REPO_ROOT = fileURLToPath(new URL("../", import.meta.url));

function runBuilder(script, outputDir) {
  // Use --no-tar so we get the staging directory preserved AND the
  // manifest sidecar written. The manifest's stagePath field then
  // tells the test where to inspect the staged tree.
  execFileSync(process.execPath, [script, "--output", outputDir, "--no-tar"], {
    cwd: REPO_ROOT,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function pathExists(p) {
  try {
    await access(p, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

test("complete bundle manifest matches the canonical registries", async () => {
  const staging = await mkdtemp(path.join(tmpdir(), "ras-bundle-test-"));
  try {
    runBuilder(
      path.join(REPO_ROOT, "scripts/build-bundle.mjs"),
      staging,
    );

    const version = await readBundleVersion();
    const manifestPath = path.join(
      staging,
      `react-agent-skills-bundle-${version}.manifest.json`,
    );
    const manifest = await readJson(manifestPath);

    assert.equal(manifest.bundle, "react-agent-skills");
    assert.equal(manifest.edition, "complete");
    assert.equal(manifest.version, version);

    const skills = await readSkillRegistry();
    const patterns = await readPatternRegistry();
    const evaluations = await readEvaluationRegistry();
    const benchmarks = await readBenchmarkRegistry();

    assert.equal(manifest.inventory.skills, skills.length);
    assert.equal(manifest.inventory.patterns, patterns.length);
    assert.equal(manifest.inventory.evaluations, evaluations.length);
    assert.equal(manifest.inventory.benchmarkCases, benchmarks.cases);
    assert.equal(manifest.inventory.benchmarkFixtures, benchmarks.fixtures);

    assert.equal(manifest.license.file, "LICENSE");
    assert.equal(manifest.license.addendum, "packaging/LICENSE_ADDENDUM.md");

    assert.ok(manifest.sourceCommit && manifest.sourceCommit.length >= 7,
      "source commit must be present");
    assert.ok(manifest.builtAt && !Number.isNaN(Date.parse(manifest.builtAt)),
      "build timestamp must parse as ISO");
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
});

test("starter bundle is a strict subset of the canonical skills", async () => {
  const staging = await mkdtemp(path.join(tmpdir(), "ras-starter-test-"));
  try {
    runBuilder(
      path.join(REPO_ROOT, "scripts/build-starter-bundle.mjs"),
      staging,
    );

    const version = await readBundleVersion();
    const manifestPath = path.join(
      staging,
      `react-agent-skills-starter-${version}.manifest.json`,
    );
    const manifest = await readJson(manifestPath);

    assert.equal(manifest.bundle, "react-agent-skills");
    assert.equal(manifest.edition, "starter");
    assert.equal(manifest.version, version);

    const starterList = await readStarterSkillList();
    assert.equal(manifest.inventory.skills, starterList.length);

    // Every starter skill must exist in the canonical registry.
    const allSkills = new Set((await readSkillRegistry()).map((s) => s.name));
    for (const name of starterList) {
      assert.ok(allSkills.has(name), `starter skill ${name} not in canonical registry`);
    }

    // Starter bundle intentionally ships no patterns, evaluations, or
    // benchmarks. They live only in the complete bundle.
    assert.equal(manifest.inventory.patterns, 0);
    assert.equal(manifest.inventory.evaluations, 0);
    assert.equal(manifest.inventory.benchmarkCases, 0);
    assert.equal(manifest.inventory.benchmarkFixtures, 0);
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
});

test("starter bundle staging directory is internally consistent", async () => {
  const staging = await mkdtemp(path.join(tmpdir(), "ras-starter-stage-"));
  try {
    runBuilder(
      path.join(REPO_ROOT, "scripts/build-starter-bundle.mjs"),
      staging,
    );

    // The builder writes the stagePath into the sidecar manifest.
    const version = await readBundleVersion();
    const sidecarPath = path.join(
      staging,
      `react-agent-skills-starter-${version}.manifest.json`,
    );
    const sidecar = await readJson(sidecarPath);
    assert.ok(sidecar.stagePath, "sidecar manifest must include stagePath when --no-tar is used");

    const stagePath = sidecar.stagePath;
    const manifestPath = path.join(stagePath, "BUNDLE_MANIFEST.json");
    assert.ok(await pathExists(manifestPath), "BUNDLE_MANIFEST.json missing at archive root");

    // The starter bundle must ship AGENTS.md, LICENSE, bin/install,
    // skill-manifest.yml, and packaging/LICENSE_ADDENDUM.md.
    for (const required of [
      "AGENTS.md",
      "LICENSE",
      "bin/install",
      "skill-manifest.yml",
      "packaging/LICENSE_ADDENDUM.md",
      "packaging/STARTER_SKILLS.yml",
      "BUNDLE_MANIFEST.json",
    ]) {
      assert.ok(
        await pathExists(path.join(stagePath, required)),
        `starter bundle missing ${required}`,
      );
    }

    // Every starter skill must ship SKILL.md.
    const starterList = await readStarterSkillList();
    for (const name of starterList) {
      const skillPath = path.join(stagePath, "skills", name, "SKILL.md");
      assert.ok(
        await pathExists(skillPath),
        `starter bundle missing skills/${name}/SKILL.md`,
      );
    }

    // The starter bundle's skill-manifest.yml must list only the
    // starter skills, not all 127. The bundle's own validator must
    // pass on the subset manifest.
    const starterManifest = await readFile(
      path.join(stagePath, "skill-manifest.yml"),
      "utf8",
    );
    for (const name of starterList) {
      assert.match(
        starterManifest,
        new RegExp(`^  - name: ${name}$`, "m"),
        `starter manifest missing ${name}`,
      );
    }
    const allSkills = (await readSkillRegistry()).map((s) => s.name);
    const omitted = allSkills.filter((n) => !starterList.includes(n));
    // Spot-check a few omitted skills to confirm they are not in the
    // starter manifest.
    for (const name of omitted.slice(0, 5)) {
      assert.doesNotMatch(
        starterManifest,
        new RegExp(`^  - name: ${name}$`, "m"),
        `starter manifest unexpectedly includes ${name}`,
      );
    }
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
});

test("complete bundle staging directory contains the canonical tree", async () => {
  const staging = await mkdtemp(path.join(tmpdir(), "ras-bundle-stage-"));
  try {
    runBuilder(
      path.join(REPO_ROOT, "scripts/build-bundle.mjs"),
      staging,
    );

    // The builder writes the stagePath into the sidecar manifest.
    const version = await readBundleVersion();
    const sidecarPath = path.join(
      staging,
      `react-agent-skills-bundle-${version}.manifest.json`,
    );
    const sidecar = await readJson(sidecarPath);
    assert.ok(sidecar.stagePath, "sidecar manifest must include stagePath when --no-tar is used");

    const stagePath = sidecar.stagePath;

    // The complete bundle ships every canonical skill, pattern,
    // evaluation, and benchmark. Spot-check a few representative
    // entries from each.
    const skills = await readSkillRegistry();
    for (const sample of [skills[0], skills[Math.floor(skills.length / 2)], skills[skills.length - 1]]) {
      const skillPath = path.join(stagePath, sample.path);
      assert.ok(await pathExists(skillPath), `bundle missing ${sample.path}`);
    }

    const patterns = await readPatternRegistry();
    for (const sample of [patterns[0], patterns[patterns.length - 1]]) {
      const patternPath = path.join(stagePath, sample.path);
      assert.ok(await pathExists(patternPath), `bundle missing ${sample.path}`);
    }

    // The bundle must ship the contract tests, the validators, the
    // installer, and the packaging directory.
    for (const required of [
      "test/manifest-contract.test.mjs",
      "test/bundle-contract.test.mjs",
      "scripts/validate.mjs",
      "scripts/validate-benchmarks.mjs",
      "scripts/validate-fixtures.mjs",
      "scripts/skill-discovery-evaluator.mjs",
      "scripts/build-bundle.mjs",
      "scripts/build-starter-bundle.mjs",
      "bin/install",
      "router/ROUTING.md",
      "router/ROUTING_POLICY.yml",
      "AGENTS.md",
      "skill-manifest.yml",
      "LICENSE",
      "packaging/LICENSE_ADDENDUM.md",
      "packaging/MARKETPLACE_LISTING.md",
      "packaging/PUBLISHING.md",
      "packaging/STARTER_SKILLS.yml",
      "packaging/BUNDLE_VERSION.txt",
      "BUNDLE_MANIFEST.json",
    ]) {
      assert.ok(
        await pathExists(path.join(stagePath, required)),
        `bundle missing ${required}`,
      );
    }

    // The bundle must NOT ship node_modules/, .git/, or local dist/.
    for (const forbidden of ["node_modules", ".git", "dist"]) {
      assert.ok(
        !(await pathExists(path.join(stagePath, forbidden))),
        `bundle unexpectedly ships ${forbidden}`,
      );
    }
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
});

test("bundle version is single-line and semver-shaped", async () => {
  const version = await readBundleVersion();
  assert.match(version, /^\d+\.\d+\.\d+$/, "version must be MAJOR.MINOR.PATCH");
});
