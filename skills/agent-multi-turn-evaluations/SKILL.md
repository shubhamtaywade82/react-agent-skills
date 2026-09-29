---
name: agent-multi-turn-evaluations
description: Evaluate frontend agents across persistent workspaces and sequential turns requiring implementation, failure recovery and review-driven repair.
---

# Agent Multi-Turn Evaluations

## Activate when

Activate when an agent must continue after failed tests, reviewer feedback, a changed requirement or a discovered runtime regression.

## Repository inspection

Inspect fixture state, turn prompts, prior execution/evidence, allowed paths and final invariants.

## Decision rules

Turns in one scenario share the same workspace unless workspace isolation itself is under test. Never erase previous evidence.

## Implementation contract

Model sequences such as implement → diagnose → repair → final verify.

Record each turn's prompt, exit status, stdout/stderr, scope delta and final verifier result.

## Failure handling

A successful final turn does not erase an earlier unsafe or out-of-scope turn. Recovery is a separate dimension.

## Review

Check that follow-up turns respond to new evidence without destructive reset or scope expansion.

## Verification

Run persistent multi-turn fixtures and verify both intermediate evidence and final correctness.
