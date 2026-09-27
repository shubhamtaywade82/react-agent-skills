# Benchmark Schema

Frontend benchmark cases are provider-neutral prompts used to measure whether an agent can inspect, route, implement, and verify React/TypeScript work.

Each case declares one primary skill and independent check dimensions. Framework adapters are referenced only when the benchmark explicitly exercises a detected toolchain.

Required fields:
- id: stable kebab-case identifier
- skill: registered primary skill
- checks: comma-separated independent dimensions
- prompt: task presented to the agent

Recommended checks:
- functional
- tests
- contract
- security
- accessibility
- performance
- scope_control
- routing

Public benchmark cases are not hidden tests. Hidden benchmark cases should be injected by an external runner.
