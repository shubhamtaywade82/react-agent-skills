---
name: playwright
description: Apply Playwright-specific browser automation, fixtures, locators, tracing, network control, and cross-browser conventions only when Playwright is detected.
---

## Activate when
Activate only when Playwright packages, config, or scripts are present.

## Repository inspection
Inspect Playwright version, projects, browser matrix, fixtures, webServer config, storage state, tracing, retries, reporters, and CI artifacts.

## Decision framework
Prefer locator strategies based on user-facing semantics. Keep fixtures deterministic and avoid arbitrary sleeps.

## Implementation
- Reuse authenticated storage state only when safe.
- Mock unstable external dependencies at network boundaries.
- Make waits event-driven.
- Capture traces and screenshots on failure when configured.
- Keep browser projects aligned with product support.

## Failure modes
Watch for flaky selectors, shared state, hidden retries, browser-specific assumptions, and external network dependencies.

## Review
Check isolation, diagnostics, browser coverage, and critical-path assertions.

## Verification
Run focused Playwright specs and the repository's configured browser projects and CI command.

## Browser quality composition

Compose with frontend-test-reliability and frontend-visual-testing for flaky-test isolation and screenshot state control.

## High-confidence browser workflow

Use isolated browser contexts, semantic/user-facing locators and web-first assertions. Prefer event-driven waits over arbitrary sleeps. Preserve traces, screenshots and network diagnostics on failures when configured, and exercise the repository's supported browser projects when compatibility is part of the contract.

Compose with `frontend-test-reliability` and `frontend-visual-testing` for flake isolation and deterministic screenshot state.
