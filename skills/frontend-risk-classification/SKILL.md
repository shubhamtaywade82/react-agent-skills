---
name: frontend-risk-classification
description: Classify frontend changes by blast radius and dynamically raise verification requirements for high-risk boundaries.
---

# Frontend Risk Classification

## Activate when

Activate before implementation whenever the change can affect shared APIs, authentication, rendering, dependencies, build output, persistence, production delivery, or multiple packages.

## Repository inspection

Identify changed assets and classify each by:

| Dimension | Low | Medium | High | Critical |
| --- | --- | --- | --- | --- |
| Scope | one leaf component | feature | shared package | cross-app/platform |
| State | local ephemeral | feature state | shared/client cache | auth/session/durable |
| Data | local mock | typed API use | API contract | security-sensitive data |
| Rendering | client-only | Suspense/transition | SSR/streaming | RSC/server functions |
| Dependency | no dependency | patch | minor/major | build/security/runtime core |
| Toolchain | docs/script | config | compiler/lint/bundler | release pipeline |
| Security | cosmetic | trusted input | untrusted input | auth/secrets/HTML |
| Production | none | test build | deploy artifact | migration/cache/rollback |

## Decision rules

Choose the highest applicable risk, then increase verification proportionally:

- **Low:** focused tests + lint/typecheck as repository standard.
- **Medium:** focused tests + integration boundary + typecheck/lint.
- **High:** affected package tests + integration/E2E where relevant + build + security/performance review.
- **Critical:** high-risk verification plus dependency/security review, production artifact inspection, rollback consideration and CI evidence.

Do not reduce the level because the diff is small. A three-line auth, RSC, package-export, or build change may be critical.

## Implementation contract

The change record should answer:

`what changed → who imports it → what runtime sees it → what data crosses it → what could fail silently`

High-risk changes must include an explicit invariant list. Examples:

- no secret reaches client output;
- public exports remain compatible;
- server/client boundary remains valid;
- stale async work cannot overwrite newer state;
- generated output matches source;
- asset/cache invalidation remains coherent.

## Failure handling

When risk is ambiguous, classify upward until repository evidence resolves it. Never classify solely from file names. Re-run the classifier after dependency or architecture changes because the risk surface may have expanded.

## Review

Look for hidden blast radius:

- barrel exports;
- shared hooks/providers;
- URL and storage schemas;
- query caches;
- auth/session transitions;
- framework route boundaries;
- dependency lockfiles;
- generated clients;
- build/release config.

## Verification

A risk classification is complete when the level, affected boundary, invariants and required verification are recorded and can be justified from repository evidence.
