# React + TypeScript Source Inventory

## Audited source

Repository: \`shubhamtaywade82/ruby-agent-skills\`

Commit: \`3ce8a2bbfef174d83c161ff7399d47742289c4e6\`

## Canonical skills

| # | Source skill | Destination |
| ---: | --- | --- |
| 1 | typescript-core-engineering | typescript-core-engineering |
| 2 | typescript-type-design | typescript-type-design |
| 3 | typescript-runtime-contracts | typescript-runtime-contracts |
| 4 | react-component-engineering | react-component-engineering |
| 5 | react-state-effects | react-hooks-effects + react-state-management |
| 6 | react-data-fetching | react-data-fetching |
| 7 | react-testing-engineering | react-testing-engineering |
| 8 | react-accessibility-performance | react-accessibility + react-performance |
| 9 | react-architecture | react-architecture |

## Canonical 24 patterns

### React — 18

- react-accessible-interaction
- react-async-ui-state
- react-component-boundary
- react-composition-over-boolean-props
- react-context-scope
- react-controlled-input
- react-effect-synchronization
- react-focus-management
- react-hook-dependency
- react-memoization-evidence-gate
- react-network-mock-boundary
- react-optimistic-rollback
- react-query-key-cache
- react-reducer-state-machine
- react-render-performance-budget
- react-server-state-boundary
- react-state-ownership
- react-user-interaction-test

### TypeScript — 6

- typescript-async-error-normalization
- typescript-branded-identifier
- typescript-discriminated-union
- typescript-generic-result
- typescript-public-api-boundary
- typescript-runtime-schema-boundary

## Dedicated evaluations — 9

- typescript-core-contract.yml
- typescript-type-design-contract.yml
- typescript-runtime-contracts.yml
- react-component-contract.yml
- react-state-effects-contract.yml
- react-data-fetching-contract.yml
- react-testing-contract.yml
- react-accessibility-performance-contract.yml
- react-architecture-contract.yml

## Non-counted cross-cutting patterns

The source also contains four React/TypeScript-specific patterns in \`patterns/stack-minimality\`:

- react-derived-state-in-render
- react-local-state-before-context
- react-native-before-dependency
- typescript-type-before-wrapper

They are intentionally tracked separately from the canonical 24-domain-pattern migration unit because their current family is cross-cutting minimality rather than React/TypeScript domain ownership.
