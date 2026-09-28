---
name: agent-multi-turn-evaluations
description: Evaluate frontend agents across persistent workspaces and sequential turns requiring implementation, failure recovery, review feedback and regression repair.
---

# Agent Multi-Turn Evaluations

## Activate when

Activate when an agent must continue after a failing test, reviewer feedback, changed requirement or discovered runtime regression.

## Repository inspection

Inspect fixture state, turn prompts, persisted workspace rules, previous verifier results and final invariants.

## Decision rules

All turns in one scenario share the same workspace unless isolation is the behavior under test. Never erase prior evidence between turns.

## Implementation contract

A scenario may sequence implement → diagnose failure → repair/review → final verify. Record each turn's prompt, exit status, stdout/stderr and workspace changes.

## Failure handling

A successful final turn does not erase earlier unsafe behavior. Score recovery separately and retain failure history.

## Review

Check that the agent responds to new evidence without scope expansion or destructive resets.

## Verification

Run multi-turn fixture tests and verify persistent-state behavior plus final independent verifiers.
