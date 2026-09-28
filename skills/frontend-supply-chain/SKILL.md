---
name: frontend-supply-chain
description: Secure frontend dependency supply chains through lockfile integrity, provenance, overrides, transitive risk and install-script review.
---

# Frontend Supply Chain

## Activate when

Activate for dependency upgrades, lockfile changes, new packages, security advisories, install scripts or provenance/SBOM work.

## Repository inspection

Inspect package manager/lockfile, dependency graph, overrides/resolutions, lifecycle scripts, package metadata, CI install mode and vulnerability tooling.

## Decision rules

Prefer maintained direct dependencies and platform primitives. Treat transitive dependencies as part of the deployed supply chain. Pin or constrain where reproducibility and security require it.

Do not accept a vulnerable package solely because it is transitive; identify upgrade, override or containment options.

## Implementation contract

Review candidate package → transitive graph → scripts → licensing/provenance → lockfile diff → runtime necessity.

Keep dependency changes isolated from unrelated formatting or feature work.

## Failure handling

Watch for typosquatting, dependency confusion, unexpected postinstall behavior, lockfile drift, duplicate core runtimes and unreviewed overrides.

## Review

Check package provenance, lockfile integrity, script execution, transitive vulnerabilities, peer dependency impact and artifact contents.

## Verification

Run clean install in the repository-supported mode, security audit tooling and affected build/test commands.
