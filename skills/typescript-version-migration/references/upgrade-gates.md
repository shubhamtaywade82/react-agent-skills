# TypeScript Upgrade Gates

Use this checklist after reading the target TypeScript release notes.

## Baseline

- Record current TypeScript, Node, bundler, test runner, ESLint parser and declaration tooling versions.
- Capture baseline typecheck, build and tests.
- Record generated/declaration output and current suppressions.

## Compiler gates

- Confirm removed/deprecated compiler options.
- Check `module` and `moduleResolution` semantics.
- Check ESM/CJS package boundaries and package exports.
- Check declaration emit and project-reference build behavior.
- Check side-effect/import diagnostics and new strictness behavior.

## Tooling gates

Upgrade peer tooling that must understand the new compiler: typed ESLint, test transforms, IDE/language service integrations, bundler plugins and code generators.

## Implementation gates

Fix source diagnostics without lowering strictness globally. Regenerate generated artifacts only after their source/configuration is correct. Treat new suppressions as exceptions that require justification.

## Exit criteria

Typecheck and build are green, generated/declaration outputs are reproducible, focused tests pass, and package-consumer behavior remains compatible.
