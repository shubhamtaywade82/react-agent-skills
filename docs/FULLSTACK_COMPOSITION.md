# Full-Stack Composition Contract

This repository is the frontend half of a composable engineering system. It works alongside a backend pack without copying backend skills, and the backend packs do not copy React skills.

| Backend | Companion pack | Seam skill (backend pack) |
| --- | --- | --- |
| Ruby on Rails | [ruby-agent-skills](https://github.com/shubhamtaywade82/ruby-agent-skills) | `rails-react-integration` |
| Node.js + TypeScript | [node-agent-skills](https://github.com/shubhamtaywade82/node-agent-skills) | `node-react-integration` |

## Installation

Install this pack next to the backend pack in the same agent:

```bash
# Rails + React
bash bin/install --agent claude                                     # run inside a ruby-agent-skills checkout
npx skills add shubhamtaywade82/react-agent-skills -a claude-code

# Node + React
npx skills add shubhamtaywade82/node-agent-skills -a claude-code
npx skills add shubhamtaywade82/react-agent-skills -a claude-code
```

Name collisions in a shared agent skill root (the last install wins):

- ruby-agent-skills still ships nine deprecated React/TypeScript skills that share a name with their replacements here (`react-architecture`, `react-data-fetching`, `typescript-runtime-contracts`, and others). Install this pack after ruby-agent-skills, and again after upgrading it, until those skills are removed from ruby-agent-skills.
- `agent-workflow` exists in both this pack and ruby-agent-skills with different content.
- node-agent-skills prefixes every skill with `node-`, so it does not collide with this pack.

## Repository selection

For a repository containing a backend and a React/TypeScript frontend, load skills by boundary:

```text
Backend change
  -> backend pack (ruby-agent-skills or node-agent-skills)

Frontend change
  -> react-agent-skills

Cross-boundary change
  -> backend pack seam skill (rails-react-integration or node-react-integration)
     + owning backend skill
  -> react-agent-skills client skills named by the seam skill
  -> shared integration contract
```

Framework route handlers that live inside the React application (Next.js, Remix, TanStack Start) stay in this pack and its framework adapter. A separate Node service or a Node backend-for-frontend routes to node-agent-skills.

When the backend pack is not installed, do the client work here and report the backend follow-up and the backend skill that owns it, rather than improvising backend guidance.

## Shared integration concerns

The packs meet at explicit contracts for:

| Concern | Rails owner | Node owner | Frontend owner |
| --- | --- | --- | --- |
| API shape/version | rails-api-integration | node-rest-api-design, node-api-versioning | typescript-api-contracts |
| Validation | rails-validations | node-schema-validation-at-boundary | typescript-runtime-contracts, react-forms-validation |
| Authentication | rails-authentication | node-session-management, node-cookie-security | auth-session-boundaries, browser-authentication |
| CSRF/CORS | rails-security | node-csrf-defense, node-cors-security | browser-authentication, frontend-networking |
| Authorization | rails-authorization | node-authorization-models | UI exposure only; the server enforces |
| Errors | rails-api-integration (error body) | node-react-integration (problem-details envelope) | typescript-async-error-modeling, react-error-resilience |
| Pagination/filtering | rails-react-integration | node-pagination-filtering | react-data-fetching, react-routing |
| Realtime | rails-action-cable | node-server-sent-events, node-websockets | frontend-realtime |
| File uploads | rails-active-storage | node-file-uploads, node-upload-security | react-forms-validation, frontend-networking |
| Generated clients | rails-api-integration | node-openapi | openapi-tooling |
| Correlation | rails-observability | node-observability | react-observability |

## Rules

1. Never treat generated TypeScript as proof that the backend response is valid at runtime.
2. Never enforce authorization only by hiding frontend controls.
3. Define API version compatibility explicitly when either side changes.
4. Reuse one error-envelope contract rather than implementing incompatible frontend and backend error taxonomies.
5. Keep request/response transport types separate from UI/domain types when their lifecycle differs.
6. Cross-boundary tests prove the contract at the boundary; they do not duplicate internal implementation tests from both packs.
7. A shared contracts package in a Node + React monorepo contains only browser-safe schemas, types, and pure functions.

## Example routing

A change to a Rails endpoint and its React consumer:

```text
ruby-agent-skills:
  rails-react-integration
  rails-api-integration
  rails-authentication / rails-authorization
  rails-test-engineering

react-agent-skills:
  typescript-api-contracts
  typescript-runtime-contracts
  react-data-fetching
  react-error-resilience
  react-testing-engineering
  frontend-e2e

shared:
  API schema/error/auth compatibility verification
```

A change to a Node endpoint and its React consumer:

```text
node-agent-skills:
  node-react-integration
  node-rest-api-design
  node-schema-validation-at-boundary
  node-http-testing

react-agent-skills:
  typescript-api-contracts
  typescript-runtime-contracts
  react-data-fetching
  react-forms-validation
  react-testing-engineering

shared:
  problem-details envelope, CORS/CSRF/cookie compatibility verification
```

No backend skill is copied into the frontend pack and no React skill is copied into a backend pack.
