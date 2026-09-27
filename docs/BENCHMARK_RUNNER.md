# Benchmark Runner

The benchmark runner is provider-neutral. It executes an explicitly supplied agent command in a disposable case workspace and records evidence.

## Usage

    node scripts/benchmark-runner.mjs       --manifest benchmarks/manifest.yml       --agent 'YOUR_AGENT_COMMAND'       --output /tmp/react-agent-benchmark.json

Optional:

    --limit N

For each case the runner writes:
- PROMPT.md with the benchmark prompt
- CASE.json with case metadata
- stdout/stderr
- process exit code and signal
- duration
- case status

The runner passes BENCHMARK_ID, BENCHMARK_SKILL, and BENCHMARK_PROMPT to the agent process.

## What the runner does not claim

A zero exit code means only that the supplied agent command completed successfully. It is not a correctness score.

Behavioral correctness requires a verifier or an integration-specific harness that checks the declared dimensions. Hidden cases must be supplied outside the public repository.

## Recommended verifier architecture

Use separate evidence for:
1. functional behavior
2. tests
3. contract adherence
4. security/accessibility/performance constraints
5. scope control
6. routing correctness

Record the skill-pack revision, benchmark revision, fixture revision, agent/model configuration, and verifier revision with every campaign result.
