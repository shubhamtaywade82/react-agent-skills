---
name: react-toolchain
description: Use for Vite/framework build tooling, TypeScript configuration, linting, formatting, package management, bundling, and CI.
---

# React Toolchain

## Purpose
Keep frontend tooling reproducible, explicit, and aligned with the repository runtime.

## Activate when
- changing Vite/framework build configuration;
- modifying tsconfig, ESLint, package scripts, dependencies, or CI;
- fixing build/type/lint failures.

## Repository inspection
Inspect package manager/lockfile, Node version, scripts, tsconfig hierarchy, bundler config, environment handling, lint/format rules, CI, and deployment assumptions.

## Decision rules
- Follow the existing package manager and lockfile.
- Keep TypeScript strictness intentional; do not weaken global settings to solve local problems.
- Resolve JSX/build behavior from actual configuration.
- Avoid dependency churn when platform/tooling primitives suffice.
- Verify production output, not just development behavior.

## Implementation procedure
1. Resolve toolchain versions and constraints.
2. Identify the failing boundary.
3. Make the smallest configuration change.
4. Validate typecheck/lint/test/production build.
5. Review lockfile and bundle consequences.

## Anti-patterns / failure modes
- switching package managers mid-task;
- globally silencing compiler/lint errors;
- duplicate conflicting configs;
- checking only dev-server success.

## Agent review checklist
- Which tool owns this behavior?
- Did production output change?
- Is the lockfile consistent?
- Are environment variables handled correctly?

## Verification
Run repository-standard typecheck/lint/test/build commands and a production build when configuration changes.

## Source foundation
- Vite: https://vite.dev/guide/
- TypeScript TSConfig: https://www.typescriptlang.org/tsconfig/

## Lint and format ownership

Compose with `eslint` for ESLint configuration and with `typescript-eslint` for typed linting. Compose with `frontend-formatting` for Prettier/Biome selection and formatting scope. Do not duplicate their detailed policies here.
