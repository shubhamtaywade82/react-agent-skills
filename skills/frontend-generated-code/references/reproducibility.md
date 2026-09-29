# Generated Code Reproducibility

Use this reference when changing schemas, generator configuration, generated output or generator versions.

## Source ownership

Define one authoritative source:

schema/API definition → generator configuration → generated artifact.

Generated files are outputs. Manual edits to generated output are not the primary fix.

## Regeneration loop

1. Change the authoritative source/configuration.
2. Run the repository's generator.
3. Inspect the complete generated diff.
4. Run focused contract/type tests.
5. Re-run generation from a clean state.
6. Confirm the generated tree is deterministic.

## Drift signals

Investigate:

- different generator versions;
- environment-dependent output;
- timestamps or unstable ordering;
- partial generation;
- checked-in artifacts that no longer match source;
- generated code importing types or modules that the source schema does not define.

Keep generator versions and configuration reproducible when the repository depends on checked-in artifacts.
