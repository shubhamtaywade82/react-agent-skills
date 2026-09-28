---
name: frontend-web-performance
description: Diagnose and improve Web performance using Core Web Vitals, resource waterfalls, long tasks, rendering traces and measured budgets.
---

# Frontend Web Performance

## Activate when

Activate for page-load performance, interaction latency, layout shift, slow navigation, asset waterfalls, font/image cost or React performance traces.

## Repository inspection

Inspect performance budgets, route entry points, bundle analyzer output, browser traces, Core Web Vitals telemetry, image/font strategy and critical request chain.

## Decision rules

Use evidence first. Analyze LCP, INP and CLS plus TTFB, long tasks, request waterfalls and JavaScript execution. Fix the dominant bottleneck before micro-optimizing components.

## Implementation contract

Trace:

navigation → server response → critical resources → hydration/render → interaction

Preserve visual and functional correctness while reducing blocking work.

## Failure handling

Separate network, server, parsing, script, render and interaction bottlenecks. Avoid arbitrary performance thresholds without repository/business context.

## Review

Check bundle size, code splitting, image dimensions, font loading, cache headers, hydration cost, long tasks and React Performance Tracks where available.

## Verification

Use repeatable browser traces and a stable test environment. Compare before/after measurements and document variance.
