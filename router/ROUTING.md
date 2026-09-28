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
| Rendering/Suspense/hydration | react-modern-rendering | react-19-modern-apis, server-components, performance, toolchain, e2e |
| React 19 APIs | react-19-modern-apis | modern-rendering, toolchain, testing |
| React Actions/forms | react-actions-forms | forms-validation, async-ui, accessibility, testing |
| Compiler optimization | react-compiler | performance, toolchain, testing |
| Server Components/client boundary | react-server-components | modern-rendering, react-server-security, api-contracts, security, framework adapter |
| RSC/server-function security | react-server-security | server-components, frontend-security, runtime-contracts, dependency-management |
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
| Unknown/new repository | frontend-repository-archetypes | agent-tool-capabilities, frontend-risk-classification |
| Runtime/browser regression | frontend-debugging | frontend-e2e, react-error-resilience, browser-security-dom-safety |
| High-impact change planning | frontend-risk-classification | owning domain skills, testing, production |

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

| TypeScript major migration | typescript-version-migration | typescript-core-engineering, typescript-configuration, dependency-management, testing |
| TypeScript build graph | typescript-build-architecture | typescript-configuration, module-design, dependency-management |
| ESLint configuration | eslint | typescript-eslint, react-toolchain |
| Typed linting | typescript-eslint | eslint, typescript-configuration, monorepo |
| Formatting contract | frontend-formatting | eslint, toolchain |
| frontend-monorepo | frontend-monorepo | relevant core ownership, testing |
| typescript-package-publishing | typescript-package-publishing | relevant core ownership, testing |
| frontend-generated-code | frontend-generated-code | relevant core ownership, testing |
| frontend-internationalization | frontend-internationalization | relevant core ownership, testing |
| frontend-offline-pwa | frontend-offline-pwa | relevant core ownership, testing |
| frontend-realtime | frontend-realtime | relevant core ownership, testing |
| frontend-web-performance | frontend-web-performance | relevant core ownership, testing |
| frontend-test-reliability | frontend-test-reliability | relevant core ownership, testing |
| frontend-visual-testing | frontend-visual-testing | relevant core ownership, testing |
| frontend-rendering-strategies | frontend-rendering-strategies | relevant core ownership, testing |
| frontend-supply-chain | frontend-supply-chain | relevant core ownership, testing |
| frontend-documentation | frontend-documentation | relevant core ownership, testing |
| frontend-codemod-migration | frontend-codemod-migration | relevant core ownership, testing |
| react-accessibility-widgets | react-accessibility-widgets | relevant core ownership, testing |
| frontend-storage | frontend-storage | relevant core ownership, testing |
| frontend-messaging | frontend-messaging | relevant core ownership, testing |
| frontend-workers | frontend-workers | relevant core ownership, testing |
| frontend-networking | frontend-networking | relevant core ownership, testing |
| browser-authentication | browser-authentication | relevant core ownership, testing |
| browser-media | browser-media | relevant core ownership, testing |

| apollo adapter | apollo | relevant core skill, testing, runtime-contracts |
| urql adapter | urql | relevant core skill, testing, runtime-contracts |
| swr adapter | swr | relevant core skill, testing, runtime-contracts |
| rtk-query adapter | rtk-query | relevant core skill, testing, runtime-contracts |
| trpc adapter | trpc | relevant core skill, testing, runtime-contracts |
| graphql-codegen adapter | graphql-codegen | relevant core skill, testing, runtime-contracts |
| openapi-tooling adapter | openapi-tooling | relevant core skill, testing, runtime-contracts |
| jotai adapter | jotai | relevant core skill, testing, runtime-contracts |
| mobx adapter | mobx | relevant core skill, testing, runtime-contracts |
| xstate adapter | xstate | relevant core skill, testing, runtime-contracts |
| react-hook-form adapter | react-hook-form | relevant core skill, testing, runtime-contracts |
| tanstack-form adapter | tanstack-form | relevant core skill, testing, runtime-contracts |
| zod adapter | zod | relevant core skill, testing, runtime-contracts |
| valibot adapter | valibot | relevant core skill, testing, runtime-contracts |
| arktype adapter | arktype | relevant core skill, testing, runtime-contracts |
| yup adapter | yup | relevant core skill, testing, runtime-contracts |
| vitest-browser adapter | vitest-browser | relevant core skill, testing, runtime-contracts |

| biome adapter | biome | platform/deployment/observability evidence |
| vercel adapter | vercel | platform/deployment/observability evidence |
| netlify adapter | netlify | platform/deployment/observability evidence |
| cloudflare adapter | cloudflare | platform/deployment/observability evidence |
| aws-frontend adapter | aws-frontend | platform/deployment/observability evidence |
| docker-kubernetes-frontend adapter | docker-kubernetes-frontend | platform/deployment/observability evidence |
| github-pages adapter | github-pages | platform/deployment/observability evidence |
| sentry adapter | sentry | platform/deployment/observability evidence |
| opentelemetry-frontend adapter | opentelemetry-frontend | platform/deployment/observability evidence |
| datadog-frontend adapter | datadog-frontend | platform/deployment/observability evidence |
| new-relic-frontend adapter | new-relic-frontend | platform/deployment/observability evidence |

| Agent evaluation design | agent-evaluation-engineering | fixture-evaluator, benchmark-runner, testing |

| Agent scoring | agent-behavior-scoring | agent-evaluation-engineering, fixtures |
| Multi-turn agent evaluation | agent-multi-turn-evaluations | agent-evaluation-engineering, testing |
| Adversarial agent evaluation | agent-adversarial-evaluations | frontend-security, browser-security-dom-safety, fixtures |
