# TypeScript Migration Without Suppression Debt

## Problem
A JavaScript-to-TypeScript migration is being accelerated with blanket any casts or compiler suppression.

## Rule
Preserve runtime behavior while reducing uncertainty at actual boundaries.

## Implementation
Convert one vertical slice, model unknown external input, and keep temporary suppressions narrow and documented.

## Verification
Track type errors before and after. Require no unexplained increase in suppression count.
