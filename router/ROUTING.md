# Routing Guide

Route by the dominant engineering boundary, then compose only real secondary constraints.

| Task | Primary | Secondary |
| --- | --- | --- |
| Feature spanning UI/state/API | react-architecture | component, state, data-fetching, testing |
| Reusable UI | react-component-engineering | accessibility, design-system, testing |
| Hook/effect bug | react-hooks-effects | component, testing, data-fetching |
| Client state | react-state-management | architecture, testing |
| API/query/cache | react-data-fetching | runtime-contracts, security, testing |
| Forms | react-forms-validation | runtime-contracts, accessibility, testing |
| Navigation | react-routing | architecture, security, testing |
| Async failures | react-error-resilience | data-fetching, testing |
| Accessibility | react-accessibility | component, testing |
| Performance | react-performance | architecture, data-fetching, toolchain |
| Security | react-security | runtime-contracts, data-fetching, routing |
| Design system | react-design-system | component, accessibility, testing |
| Toolchain | react-toolchain | TypeScript, testing |
| Telemetry | react-observability | error-resilience, security |
| Type contracts | typescript-type-design | core-engineering, runtime-contracts |
| Runtime input | typescript-runtime-contracts | data-fetching, security |
| Review | react-review | owning domain skills |

## Routing rules

1. Trigger matches activate inspection, not ownership.
2. Prefer one primary skill.
3. Add secondary skills only for concrete dependencies.
4. Keep UI state, server state, synchronization, and runtime validation as separate concerns.
5. Security and accessibility are implementation constraints, not post-hoc cleanup.
