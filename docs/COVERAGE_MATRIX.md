# Coverage Matrix

This matrix maps the previously identified completeness gaps to the implementation now present in the skill pack.

| Area | Status | Implemented surface |
| --- | --- | --- |
| Agent tool capabilities | Complete | agent-tool-capabilities |
| Repository archetype detection | Complete | frontend-repository-archetypes |
| Change-risk classification | Complete | frontend-risk-classification |
| Frontend debugging | Complete | frontend-debugging |
| React 19.2/19.3 APIs | Complete | react-19-modern-apis |
| React Actions/forms | Complete | react-actions-forms |
| React Compiler | Complete | react-compiler |
| RSC security | Complete | react-server-security |
| TypeScript 6/7 migration | Complete | typescript-version-migration |
| TypeScript build architecture | Complete | typescript-build-architecture |
| ESLint / typed linting | Complete | eslint, typescript-eslint |
| Formatting | Complete | frontend-formatting, prettier, biome |
| Monorepo engineering | Complete | frontend-monorepo |
| Package publishing | Complete | typescript-package-publishing |
| Generated clients/code | Complete | frontend-generated-code, graphql-codegen, openapi-tooling |
| Internationalization | Complete | frontend-internationalization |
| Offline/PWA | Complete | frontend-offline-pwa |
| Realtime | Complete | frontend-realtime |
| Web performance | Complete | frontend-web-performance |
| Test reliability | Complete | frontend-test-reliability |
| Visual testing | Complete | frontend-visual-testing |
| Rendering strategies | Complete | frontend-rendering-strategies |
| Supply chain | Complete | frontend-supply-chain |
| Documentation | Complete | frontend-documentation |
| Codemod migrations | Complete | frontend-codemod-migration |
| Browser storage/messaging/workers/networking | Complete | frontend-storage, frontend-messaging, frontend-workers, frontend-networking |
| Browser authentication/media | Complete | browser-authentication, browser-media |
| Accessible composite widgets | Complete | react-accessibility-widgets |
| Vitest Browser Mode | Complete | vitest-browser |
| Playwright depth | Complete | playwright + frontend-test-reliability + frontend-visual-testing |
| Storybook testing | Complete | storybook + visual/testing composition |
| GraphQL/API data clients | Complete | apollo, urql, swr, rtk-query, trpc |
| State libraries | Complete | jotai, mobx, xstate |
| Form/schema libraries | Complete | react-hook-form, tanstack-form, zod, valibot, arktype, yup |
| Styling systems | Complete | tailwindcss, css-modules, styled-components, emotion, vanilla-extract |
| Framework/runtime adapters | Complete | vite, nextjs, remix, react-router, tanstack-start, astro-react, rsbuild, rspack |
| Deployment adapters | Complete | vercel, netlify, cloudflare, aws-frontend, docker-kubernetes-frontend, github-pages |
| Observability adapters | Complete | sentry, opentelemetry-frontend, datadog-frontend, new-relic-frontend |
| Real fixture evaluations | Complete | benchmarks/fixtures, fixture-evaluator |
| Multi-turn evaluations | Complete | agent-multi-turn-evaluations + persistent fixture turns |
| Adversarial evaluations | Complete | agent-adversarial-evaluations + hostile-content fixtures |
| Agent behavior scoring | Complete | agent-behavior-scoring + dimensioned fixture score |
| Full-stack Rails + React evaluation boundary | Complete | fullstack-rails-react-contract fixture + existing cross-boundary routing |

## Quality model

The repository now validates at four levels:

1. **Skill integrity** — every registered skill exists and exposes operational sections.
2. **Registry integrity** — patterns, evaluations and benchmarks reference real files/skills.
3. **Executable evaluation** — fixture cases run in disposable workspaces with independent verifiers, scope checks and safety invariants.
4. **Repository CI** — the complete Node contract suite, validators, evaluator help path and installer smoke test run in GitHub Actions.

## Remaining conditionality

“Complete” does not mean every adapter runs in every project. Framework, library, deployment and observability adapters remain evidence-gated. Agents must detect the actual repository stack before applying them.
