---
name: storybook
description: Apply Storybook-specific component isolation, stories, interaction tests, visual states, and design-system conventions only when Storybook is detected.
---

## Activate when
Activate only when Storybook config, packages, or stories are present.

## Repository inspection
Inspect Storybook version, framework adapter, story format, decorators, global providers, interaction testing, visual regression, and build scripts.

## Decision framework
Treat stories as executable component documentation and state coverage, not a substitute for application integration tests.

## Implementation
- Cover meaningful states and composition variants.
- Keep stories deterministic and provider setup intentional.
- Use interaction tests for user-visible behavior.
- Reuse design-system tokens and fixtures.

## Failure modes
Watch for one-story-per-prop explosion, stories that depend on live APIs, hidden global state, and visual snapshots that mask semantic regressions.

## Review
Check state coverage, accessibility, composition, and determinism.

## Verification
Run Storybook tests and production build where configured; use visual regression only for stable surfaces.

## Current testing composition

When the repository uses the modern Storybook test integration, prefer its Vitest-based workflow for interaction/accessibility checks and compose with frontend-visual-testing for visual coverage.
