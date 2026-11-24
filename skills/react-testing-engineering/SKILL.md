---
name: react-testing-engineering
description: Use when testing React components, hooks, forms, async UI, user interactions, accessibility, and integration boundaries.
license: MIT
---

# React Testing Engineering

## Purpose

Test observable UI contracts and state transitions while minimizing implementation coupling. A React test should survive any refactor that preserves user-visible behavior — that is the whole standard. Implementation-coupled tests (private state, class names, snapshot-only) fail on harmless refactors and train the team to delete tests.

## Activate when

- adding/repairing React tests;
- testing async UI or user interactions;
- replacing brittle selectors or mocks.

## Boundary with related skills

- Use `react-testing-engineering` for component/hook-level tests.
- Use `frontend-e2e` for journeys that need a real browser.
- Use `testing-library` / `vitest` for toolchain configuration and framework-specific mechanics.
- Use `react-async-ui` for the async state matrix being tested (this skill proves it).

## Repository inspection

Inspect test runner (Vitest/Jest), DOM environment (jsdom/happy-dom), Testing Library setup, network mocking (MSW or fetch stubs), fake timers, accessibility checks (jest-axe or equivalent), coverage policy, and CI. Follow the repository's existing setup patterns (`setupTests.ts`, custom render helpers, test-id conventions) before introducing new tooling.

## Decision rules

- Prefer user-observable assertions.
- Prefer role/name/label queries.
- Use realistic interaction APIs such as user-event when available.
- Mock stable external boundaries (network, timers beyond real thresholds), not React internals by default.
- Synchronize async work explicitly (await `findBy*` queries, `waitFor` with specific assertions) — never fixed sleeps.
- Test rejection and recovery (error states, retry affordances), not only the happy path.

Choosing the proving boundary: the smallest test that exercises the behavior through user-observable output. A pure domain function gets a unit test; a component with interaction gets a Testing Library test; a cross-route journey goes to E2E. Nothing in between justifies a heavier test.

## Implementation procedure

1. Identify the user-visible contract.
2. Choose the smallest proving boundary.
3. Control external dependencies.
4. Exercise realistic interaction.
5. Assert UI and meaningful side effects.
6. Add regression coverage.

**Reference example** — a form component tested through user interaction with controlled network and real timers:

```tsx
// CheckoutForm.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  http.post("/api/orders", async ({ request }) => {
    const body = await request.json();
    return body.items.length > 0
      ? HttpResponse.json({ id: "ord_123" }, { status: 201 })
      : new HttpResponse(null, { status: 422 });
  }),
);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());

test("submits the order and confirms", async () => {
  const user = userEvent.setup();
  render(<CheckoutForm items={twoItems} />);

  await user.type(screen.getByLabel("Email"), "buyer@example.com");
  await user.click(screen.getByRole("button", { name: "Place order" }));

  expect(await screen.findByRole("status")).toHaveTextContent("Order ord_123 confirmed");
});

test("shows field errors for a rejected submission", async () => {
  const user = userEvent.setup();
  render(<CheckoutForm items={[]} />); // server responds 422

  await user.click(screen.getByRole("button", { name: "Place order" }));

  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent(/couldn'?t be processed/i));
  expect(screen.getByRole("button", { name: "Place order" })).toBeEnabled();
});

test("disables submission while the request is in flight", async () => {
  let resolveRequest: (v: HttpResponse) => void = () => {};
  server.use(http.post("/api/orders", () =>
    new Promise<HttpResponse>((resolve) => (resolveRequest = resolve))));
  const user = userEvent.setup();
  render(<CheckoutForm items={twoItems} />);

  const submit = screen.getByRole("button", { name: "Place order" });
  await user.click(submit);
  expect(submit).toBeDisabled();

  resolveRequest(HttpResponse.json({ id: "ord_456" }, { status: 201 }));
  expect(await screen.findByRole("status")).toBeInTheDocument();
});
```

## Anti-patterns / failure modes

- Private-state assertions (`expect(result.current._isLoading)`) — assert rendered output.
- Class-name selectors for semantics — queries by role/name survive refactors.
- Arbitrary `setTimeout` sleeps — use `findBy*`/`waitFor`.
- Snapshot-only tests that approve everything diff-blind.
- Mocking every child component — mocks at stable external boundaries (network) instead.
- FireEvent for user input where `userEvent` exists — fireEvent bypasses focus, keydown, and form semantics.
- Fake timers left running across tests — restore in `afterEach` or async work hangs silently.

## Agent review checklist

- [ ] Would this test survive a harmless refactor (rename, restructure)?
- [ ] Is async behavior deterministic (no sleeps, explicit awaits)?
- [ ] Does it prove user behavior (queries by role/name, assertions on rendered output)?
- [ ] Are failure/recovery paths covered (error state, retry, disabled-during-flight)?
- [ ] Are mocks at stable boundaries only (network, not children/internals)?

## Verification

Run focused tests, integration tests as needed, typecheck, lint, and the repository's standard suite. For flaky-prone async tests, run the focused file repeatedly (e.g. `vitest run path/to/file --repeat 5`) before merging.

## Source foundation

Testing Library guiding principles and query priority: https://testing-library.com/docs/queries/about/#priority. user-event realistic interaction model: https://testing-library.com/docs/user-event/intro. MSW request-level interception: https://mswjs.io/docs/. Repository conventions should still be inspected before implementation.
