# Package Export Checklist

Use this reference when changing a TypeScript library's package surface.

## Contract

Verify:

source → emitted JavaScript → declarations → `exports` → packed artifact → disposable consumer.

## Export map

Check every non-pattern target in `exports` exists. Keep runtime and declaration targets aligned. Avoid exposing private paths accidentally.

## Module strategy

Prefer one coherent module strategy. When both ESM and CommonJS are intentionally supported, verify each condition separately and test consumer behavior rather than only inspecting file names.

## Package contents

Run the repository's pack command and inspect the tarball. Confirm the `files` allowlist includes required JS, declaration and metadata files and excludes source/secrets that should not ship.

## Compatibility

Check peer dependency ranges, engines, semver impact and declaration compatibility. A declaration-only change can still be a public API change.
