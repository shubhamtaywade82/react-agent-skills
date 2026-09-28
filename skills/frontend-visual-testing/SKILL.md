---
name: frontend-visual-testing
description: Add deterministic visual regression tests across viewport, theme, locale and reduced-motion states without unstable screenshot noise.
---

# Frontend Visual Testing

## Activate when

Activate for visual regression, screenshot baselines, design-system changes or browser rendering differences.

## Repository inspection

Inspect screenshot runner, baseline storage, fonts, animations, viewport/device matrix, themes, locale/RTL support and diff thresholds.

## Decision rules

Visual tests must be deterministic. Disable or control animations, wait for fonts and relevant network data, and use stable fixtures.

Do not normalize away meaningful layout differences just to make tests pass.

## Implementation contract

Capture the smallest representative state matrix: viewport × theme × locale/RTL × interaction state. Keep dynamic data fixed.

## Failure handling

Separate rendering changes from environment noise such as missing fonts, GPU differences, animations and nondeterministic data.

## Review

Review baseline diffs semantically. A changed snapshot requires a reason, not automatic approval.

## Verification

Run affected screenshots, inspect diffs, then execute repository-standard visual checks.
