# React Transition Boundary

## Problem
A slow non-urgent update blocks urgent input or navigation feedback.

## Rule
Separate urgent updates from non-urgent rendering work when concurrent React features are supported.

## Implementation
Wrap only non-urgent work in the repository's established transition mechanism. Do not use transitions to hide correctness issues or network latency.

## Verification
Test that urgent input remains responsive and the transitioned content resolves to the expected state.
