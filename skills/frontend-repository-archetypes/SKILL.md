---
name: frontend-repository-archetypes
description: Classify frontend repository archetypes before routing skills, including application vs library, monorepo/workspace structure, framework/runtime shape, package boundaries, and deployment assumptions.
---

# Frontend Repository Archetypes

## Activate when

Activate at the beginning of a frontend task when repository structure, runtime model, package topology, or rendering strategy is not already established.

## Repository inspection

Inspect:

- `package.json`, lockfile and workspace configuration;
- `tsconfig*.json`, ESLint/formatter configuration and build scripts;
- framework dependencies and config files;
- app, pages, routes, server, client and package directories;
- test/e2e/storybook configuration;
- deployment manifests and container definitions;
- API schema or backend integration boundaries.

Classify the repository across independent axes rather than assigning one label.

| Axis | Examples | Evidence |
| --- | --- | --- |
| UI runtime | SPA, SSR, SSG, streaming, RSC | framework config, routes, server entry |
| package topology | single app, workspace, monorepo | workspaces, pnpm/yarn/npm, nx/turbo |
| artifact type | application, library, design system, SDK | package exports, publish scripts |
| data model | REST, GraphQL, RPC, realtime | clients, schemas, transport code |
| browser capability | standard web, PWA, worker-heavy, media | service worker, workers, media APIs |
| styling | CSS, modules, utility, CSS-in-JS, tokens | config and imports |
| test topology | unit, DOM, browser, E2E, visual | test configs and scripts |
| deployment | static CDN, container, edge/serverless, platform | CI/deploy manifests |

## Decision rules

1. Never infer Next.js, Remix, Vite, or another framework only from React being installed.
2. For mixed repositories, classify each application/package separately.
3. A monorepo requires package-level routing plus workspace-level dependency/build analysis.
4. A library requires stronger exported API and packaging checks than a private application.
5. An RSC repository requires server/client boundary and RSC security checks.
6. A Rails/React repository requires cross-boundary API/auth/error semantics and composes with `ruby-agent-skills` (`rails-react-integration`); a Node.js backend + React repository composes with `node-agent-skills` (`node-react-integration`). Classify the backend from its own manifest (`Gemfile`, server `package.json`) before choosing the pack.

## Implementation contract

Create an archetype record before large changes:

`runtime + package topology + artifact type + data boundary + browser concerns + tests + deployment`

Use it to activate conditional adapters. If evidence conflicts, prefer the narrowest confirmed interpretation and re-inspect before implementation.

## Failure handling

Common failures:

- routing by file extension instead of actual runtime;
- applying SPA assumptions to SSR/RSC code;
- treating a monorepo as one package;
- changing a published package without export/declaration checks;
- adding framework-specific code to a framework-agnostic package.

Stop and reclassify when build, routing, or runtime evidence contradicts the current archetype.

## Review

Verify that every activated adapter has repository evidence and that no conditional adapter was loaded merely because it is popular.

## Verification

An archetype classification is complete when another agent can reproduce it from checked-in repository evidence and derive the same primary and conditional skills.
