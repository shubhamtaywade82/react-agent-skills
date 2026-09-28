---
name: rsbuild
description: Apply Rsbuild conventions for entrypoints, environments, plugins and production bundles when Rsbuild is present.
---

# Rsbuild Adapter

## Activate when

Activate only when Rsbuild packages/configuration are present.

## Repository inspection

Inspect config, entries, plugins, environment variables and output targets.

## Decision rules

Use repository-defined entry/plugin architecture; avoid Vite assumptions without evidence.

## Implementation contract

config → plugins → entry graph → emitted assets → runtime environment.

## Failure handling

Watch for plugin incompatibility, env leakage and output-path drift.

## Review

Check client/server targets and public asset contents.

## Verification

Run configured dev/build/typecheck and inspect production output when relevant.
