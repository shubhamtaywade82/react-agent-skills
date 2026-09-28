---
name: vitest-browser
description: Use Vitest Browser Mode for real-browser component tests when repository evidence confirms supported browser providers and configuration.
---

# Vitest Browser Adapter

## Activate when

Activate only when Vitest Browser Mode configuration or a supported browser provider is present.

## Repository inspection

Inspect Vitest version/config, browser provider, headed/headless mode, browser matrix and Testing Library/browser utilities.

## Decision rules

Use Browser Mode when real browser semantics matter and a DOM emulator is insufficient. Keep browser tests focused on observable behavior.

## Implementation contract

real browser → user interaction → DOM/browser API → assertion → diagnostic artifacts.

Avoid duplicating the same case in every test environment unless the execution context materially differs.

## Failure handling

Handle provider startup, browser sandbox, font/viewport differences and isolation failures as environment versus product issues.

## Review

Check browser provider pinning, deterministic fixtures, console/network diagnostics and test isolation.

## Verification

Run affected Browser Mode tests, then CI-equivalent Vitest tests.
