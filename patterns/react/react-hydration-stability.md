# React Hydration Stability

## Problem
Server-rendered markup differs from the first client render.

## Rule
The initial client render must match server output for hydration-sensitive regions.

## Implementation
Avoid reading browser-only state during the first render. Defer client-only differences to explicit lifecycle synchronization or a framework-supported boundary.

## Verification
Run SSR/hydration tests and exercise locale, timezone, random, media-query, and persisted-state inputs where relevant.
