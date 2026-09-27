# Routing Guide

Route by the dominant engineering boundary, then compose only real secondary constraints. Framework/tool adapters are conditional: activate them only after repository inspection proves the dependency/runtime is present.

| Task | Primary | Secondary |
| --- | --- | --- |
| Feature spanning UI/state/API | react-architecture | component, state, data-fetching, api-contracts, testing |
| Frontend module boundaries | frontend-architecture | react-architecture, state-management, testing |
| Reusable UI | react-component-engineering | accessibility, design-system, styling, testing |
| Hook/effect bug | react-hooks-effects | component, async-ui, data-fetching, testing |
| Client state | react-state-management | architecture, async-ui, testing |
| API/query/cache | react-data-fetching | typescript-api-contracts, runtime-contracts, security, testing |
| Async UI | react-async-ui | data-fetching, error-resilience, testing |
| Forms | react-forms-validation | runtime-contracts, accessibility, async-ui, testing |
| Navigation | react-routing | architecture, auth-session, security, testing |
| Browser API/DOM | frontend-browser-platform | browser-security-dom-safety, accessibility, testing |
| E2E workflow | frontend-e2e | routing, auth-session, data-fetching, accessibility |
| Accessibility | react-accessibility | component, styling, frontend-e2e, testing |
| Performance | react-performance | architecture, data-fetching, toolchain, modern-rendering |
| Rendering/Suspense/hydration | react-modern-rendering | server-components, performance, toolchain, e2e |
| Server Components/client boundary | react-server-components | modern-rendering, api-contracts, security, framework adapter |
| Security audit | frontend-security | browser-security-dom-safety, auth-session, api-contracts |
| Authentication/session | auth-session-boundaries | routing, data-fetching, frontend-security, e2e |
| Styling/layout | frontend-styling-layout | accessibility, design-system, performance |
| Environment/config | frontend-environment-configuration | toolchain, production, runtime-contracts |
| Dependency change | frontend-dependency-management | toolchain, security, performance |
| Production/release | frontend-production | toolchain, observability, environment, e2e |
| Type contract | typescript-type-design | core-engineering, public-api-design |
| Async errors | typescript-async-error-modeling | runtime-contracts, data-fetching, testing |
| Public package/module API | typescript-public-api-design | type-design, api-contracts |
| API boundary | typescript-api-contracts | runtime-contracts, security, data-fetching |
| Runtime input | typescript-runtime-contracts | api-contracts, security |
| Test architecture | react-testing-engineering | frontend-e2e, data-fetching, accessibility |
| Observability | react-observability | error-resilience, security, production |
| Code review | react-review | owning domain skills |

## Conditional adapter routing

| Detected repository evidence | Conditional skill |
| --- | --- |
| Vite config/scripts | vite |
| Next.js app and next package | nextjs |
| Remix package/routes | remix |
| React Router package/config | react-router |
| TanStack Query package | tanstack-query |
| Redux Toolkit or Redux package | redux |
| Zustand package | zustand |
| Vitest config/package | vitest |
| Testing Library packages | testing-library |
| Playwright config/package | playwright |
| Cypress config/package | cypress |
| Storybook config/package | storybook |
| MSW package/handlers | msw |

## Routing rules

1. Trigger matches activate inspection, not ownership.
2. Prefer one primary skill.
3. Add secondary skills only for concrete dependencies.
4. Load framework/tool adapters only after dependency, config, or source evidence confirms them.
5. Keep UI state, server state, synchronization, runtime validation, and browser trust as separate concerns.
6. Cross-boundary Rails/API work must compose with ruby-agent-skills; do not duplicate Rails backend guidance here.
7. Security and accessibility are implementation constraints, not post-hoc cleanup.
