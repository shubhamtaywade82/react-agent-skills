# Evaluation Migration

The React/TypeScript evaluation migration preserves all nine source evaluation contracts and splits the two combined source contracts along the new ownership boundaries.

## Destination contracts

1. typescript-core-contract
2. typescript-type-design-contract
3. typescript-runtime-contracts
4. react-component-contract
5. react-hooks-effects-contract
6. react-state-management-contract
7. react-data-fetching-contract
8. react-testing-contract
9. react-accessibility-contract
10. react-performance-contract
11. react-architecture-contract

## Split rules

react-state-effects is represented by independent react-hooks-effects and react-state-management evaluations.

react-accessibility-performance is represented by independent react-accessibility and react-performance evaluations.

Evaluation difficulty and verification dimensions remain explicit: functional behavior, tests, contract adherence, and scope control.

The source Ruby pack retains its original evaluation files during the migration window.
