# React Refresh Preserves Data

## Problem
A background refresh replaces usable data with a global loading screen.

## Rule
Represent initial loading separately from refreshing when stale data remains valid.

## Implementation
Keep the last valid result visible while refresh state is exposed through a non-destructive status. Do not clear data unless the resource contract requires it.

## Verification
Test initial load, successful refresh, failed refresh with stale data, and retry.
