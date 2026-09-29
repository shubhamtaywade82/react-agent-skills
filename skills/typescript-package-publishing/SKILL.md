---
name: typescript-package-publishing
description: Package and publish TypeScript libraries with correct exports, declarations, peer dependencies, module formats and semver boundaries.
---

# TypeScript Package Publishing

## Activate when

Activate for publishable libraries, SDKs, component packages, declaration output, package exports, ESM/CJS support or semver-sensitive API changes.

## Repository inspection

Inspect package.json exports/types/main/module, files list, build output, declaration generation, peerDependencies, engines, package manager, release scripts and package-consumption tests.

## Decision rules

Treat the package.json export map as public API. Prefer a single coherent module strategy when possible. Avoid dual-package hazards and extension ambiguity. Keep React as a peer dependency when consumers must supply the runtime.

## Implementation contract

Verify source → emitted JS → declarations → export map → packed artifact → consumer import.

Test import/require conditions supported by the package and verify declarations resolve exactly as runtime exports do.

## Failure handling

Watch for deep imports, missing types, accidental private exports, ESM/CJS divergence, bundled peer dependencies, incorrect files allowlists and semver-breaking changes presented as patches.

## Review

Review public exports, declaration signatures, package size/content, peer dependency ranges and compatibility matrix.

## Verification

Build, pack, inspect the tarball, install into a disposable consumer and run import/typecheck tests.


## Progressive disclosure

Read `references/export-checklist.md` when changing `exports`, declaration output, module formats, package contents or release compatibility. Run `node scripts/validate-package-exports.mjs <package-root>` before finalizing an export-map change.
