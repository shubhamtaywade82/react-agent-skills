# Storybook State Matrix

## Problem
A reusable component has stories only for the happy path.

## Rule
Stories should encode meaningful visual and interaction states.

## Implementation
Cover empty, loading, error, disabled, focus, responsive, and key composition variants that are part of the component contract.

## Verification
Run story render and interaction tests; add visual regression only for stable deterministic surfaces.
