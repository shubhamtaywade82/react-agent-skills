---
name: vite
description: Apply Vite-specific configuration, environment, plugin, build, dev-server, and asset conventions only in repositories using Vite.
---

## Activate when
Activate only when package scripts, vite config, Vite plugins, or the Vite package confirm Vite is the build/runtime tool.

## Repository inspection
Inspect Vite version, config files, modes, env prefixes, aliases, plugins, SSR settings, dev-server behavior, asset paths, and build scripts.

## Decision framework
Prefer existing Vite conventions. Treat environment exposure, plugin ordering, aliases, and SSR mode as explicit contracts.

## Implementation
- Keep client-exposed env variables within the framework's intended public prefix.
- Preserve mode-specific config semantics.
- Keep plugin additions minimal and scoped.
- Verify asset/base-path behavior for the deployment target.

## Failure modes
Watch for secret leakage, incorrect base URLs, plugin order regressions, SSR/client divergence, and aliases that work only in the editor.

## Review
Check config resolution for the active mode and the production build output.

## Verification
Run the repository's Vite typecheck/tests/build and inspect the built artifact when config or asset behavior changed.
