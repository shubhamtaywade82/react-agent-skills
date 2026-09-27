# Full-Stack Composition Contract

This repository is the frontend half of a composable engineering system. It must work alongside \`ruby-agent-skills\` without copying backend skills.

## Repository selection

For a repository containing both:

- Ruby/Rails backend code
- React/TypeScript frontend code

load skills by boundary.

\`\`\`text
Backend change
  -> ruby-agent-skills

Frontend change
  -> react-agent-skills

Cross-boundary change
  -> both packs
  -> shared integration contract
\`\`\`

## Shared integration concerns

The packs must meet at explicit contracts for:

| Concern | Backend owner | Frontend owner |
| --- | --- | --- |
| API shape/version | Rails API | TypeScript API contracts |
| Validation | Rails domain/API | runtime-contract validation + UX |
| Authentication | Rails authentication/session | auth-session boundary |
| Authorization | Rails authorization | UI exposure + server resource enforcement |
| Errors | API error envelope | async error modeling + recovery |
| Pagination/filtering | API semantics | URL/data-fetching semantics |
| Idempotency | server mutation semantics | mutation behavior |
| Correlation | backend telemetry | frontend observability |
| File/media contracts | backend upload/storage | browser upload/data boundary |

## Rules

1. Never treat generated TypeScript as proof that the backend response is valid at runtime.
2. Never enforce authorization only by hiding frontend controls.
3. Define API version compatibility explicitly when either side changes.
4. Reuse one error-envelope contract rather than implementing incompatible frontend and backend error taxonomies.
5. Keep request/response transport types separate from UI/domain types when their lifecycle differs.
6. Cross-boundary tests should prove the contract at the boundary, not duplicate internal implementation tests from both packs.

## Example routing

A change to a Rails endpoint and its React consumer should normally route to:

\`\`\`text
ruby-agent-skills:
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
\`\`\`

No Rails skill is copied into the frontend pack and no React skill is copied into the backend pack.
