---
name: frontend-e2e
description: Validate critical browser workflows at the real page and network boundary with deterministic end-to-end tests.
license: MIT
---

# Frontend E2E

## Purpose

Prove that critical user journeys work at the real browser boundary — real DOM, real navigation, real network — where unit and component tests cannot. E2E tests are the most expensive tests in the portfolio: run them on the paths whose failure costs the most, and keep everything else in cheaper layers.

## Activate when

Use when a change affects navigation, authentication, forms, payments, multi-step workflows, browser APIs, or other user journeys that component tests cannot prove.

## Boundary with related skills

- Use `frontend-e2e` when the behavior must be proven across page loads, routes, or real browser APIs.
- Use `react-testing-engineering` for component- and hook-level behavior (Rendering, interaction, effects) that does not need a browser.
- Use `frontend-debugging` when an E2E failure needs diagnosis rather than coverage.
- Use `playwright` / `frontend-networking` when the task is specifically about the E2E toolchain or network interception mechanics.

Do not activate all four for a single test addition; one primary skill owns the boundary.

## Repository inspection

Identify the existing E2E framework (Playwright, Cypress, or a framework-specific runner), browser matrix, test web server (base URL and port conventions), fixtures, authentication bootstrap (storage state, session injection), network interception (route mocking), selector conventions (test IDs vs roles), retry policy, and CI execution model (sharding, workers, artifacts).

Use repository convention before imposing a generic structure: an existing `playwright.config.ts` with `storageState`, role-based locators, or custom fixtures wins over a generic template.

## Decision framework

Use E2E only for cross-boundary behavior that needs a browser. Keep most logic in unit/component tests. Prefer stable user-facing selectors and deterministic test data.

- **Coverage allocation:** if a defect could be caught by a component test, write the component test; E2E only for journeys crossing routing, network, or persistence boundaries.
- **Selector strategy:** prefer accessible roles and labels (`getByRole`, `getByLabel`) over CSS paths; use `data-testid` only when no accessible name exists.
- **Determinism over speed:** event-driven waits (`await expect(locator).toBeVisible()`), never fixed sleeps; unique per-run test data (seeded names, IDs) to avoid collisions in shared environments.
- **Auth isolation:** bootstrap authenticated sessions once per role via storage state instead of logging in inside every scenario.

## Implementation

- Test user-visible outcomes, not component internals.
- Isolate authentication setup from each scenario when safe.
- Control third-party and unstable network boundaries (mock payment providers, analytics, third-party embeds at the route level).
- Make waits event-driven; avoid arbitrary sleeps.
- Capture traces/screenshots only on failure by default; keep traces on for local debugging.

**Reference example** — a deterministic checkout-journey spec with role-based locators, seeded data, route-level mocking of third-party payment, and event-driven assertions:

```ts
// tests/e2e/checkout.spec.ts
import { test, expect } from "@playwright/test";
import { createSeededCart } from "./fixtures/cart";

test.describe("checkout journey", () => {
  let cartId: string;

  test.beforeEach(async ({ request }) => {
    cartId = await createSeededCart(request, { items: 2, total: 4200 }); // cents
  });

  test("completes purchase with saved address", async ({ page }) => {
    await page.route("**/api/payments/stripe**", (route) =>
      route.fulfill({ json: { status: "succeeded", id: "pay_test_1" } }));

    await page.goto(`/cart/${cartId}`);
    await page.getByRole("button", { name: "Checkout" }).click();

    await expect(page.getByRole("heading", { name: "Confirm order" })).toBeVisible();
    await page.getByLabel("Card number").fill("4242 4242 4242 4242");
    await page.getByRole("button", { name: "Pay $42.00" }).click();

    await expect(page.getByRole("status")).toContainText("Order confirmed");
    await expect(page).toHaveURL(/\/orders\/[\w-]+$/);
  });

  test("shows retryable error when payment declines", async ({ page }) => {
    await page.route("**/api/payments/stripe**", (route) =>
      route.fulfill({ status: 402, json: { code: "card_declined" } }));

    await page.goto(`/cart/${cartId}`);
    await page.getByRole("button", { name: "Checkout" }).click();
    await page.getByLabel("Card number").fill("4000 0000 0000 0002");
    await page.getByRole("button", { name: "Pay $42.00" }).click();

    await expect(page.getByRole("alert")).toContainText("Payment declined");
    await expect(page.getByRole("button", { name: "Try again" })).toBeEnabled();
  });
});
```

## Failure modes

- Flaky timing from sleep-based waits or animations mid-transition — wait for a deterministic state, disable animations in test mode.
- Environment coupling: tests depending on a shared backend's mutable data; seed per-run data instead.
- Brittle selectors chained to class names or DOM order that break on styling refactors.
- Hidden network dependencies: a third-party script blocking `load` — mock it at route level.
- Tests that pass in Chromium but fail in WebKit (date formatting, focus behavior, viewport assumptions) — run the declared matrix locally before pushing.
- E2E suites growing into a full regression portfolio, starved of unit tests — reallocate coverage downward.

## Agent review checklist

- [ ] Journey crosses a real browser boundary (route, network, or persistence) — not just component state.
- [ ] Locators use roles/labels; no structural CSS selectors.
- [ ] No fixed sleeps; every wait is event-driven.
- [ ] Auth bootstrapped via storage state, not per-scenario login flows.
- [ ] Third-party boundaries mocked; test data unique per run.
- [ ] Failure artifacts (trace/screenshot) configured on failure only.

## Verification

Run the focused E2E spec first (`npx playwright test checkout`), then the repository's full E2E command and CI-equivalent command when practical. Confirm the spec passes twice consecutively before merging — one green run is not determinism evidence. Report exactly which journeys are covered and which remain unverified.

## Source foundation

Playwright test conventions (role-based locators, `expect` auto-retrying assertions, storage state, route interception) follow the official Playwright docs at https://playwright.dev/docs/intro; accessible-name-based selection aligns with WAI-ARIA https://www.w3.org/WAI/standards-guidelines/aria/. Repository conventions should still be inspected before implementation.
