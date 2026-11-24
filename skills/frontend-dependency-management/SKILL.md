---
name: frontend-dependency-management
description: Evaluate, add, upgrade, remove, and constrain frontend dependencies with explicit technical and operational justification.
license: MIT
---

# Frontend Dependency Management

## Purpose

Every frontend dependency is a long-term rent payment: bundle weight, security surface, upgrade pressure, and maintenance risk paid forever for capability rented today. The browser and React already ship a enormous standard library — layout, fetching, forms, state. The discipline is a decision ladder (browser primitive → React primitive → existing dependency → new dependency), honest cost accounting, and lockfile hygiene that keeps the dependency graph an audited artifact instead of an accident.

## Activate when

- adding, upgrading, replacing, or removing a package;
- reviewing lockfile churn, duplicate packages, or peer-dependency conflicts;
- assessing bundle/runtime impact of a dependency;
- responding to a security advisory in the dependency tree.

## Boundary with related skills

- Use `frontend-security` for the security policy (supply-chain review, SRI, advisories) around these decisions.
- Use `frontend-production` for bundle-size gates and artifact impact measurement.
- Use `typescript-configuration` when a dependency changes compiler/tooling requirements.
- Use `frontend-styling-layout` when the dependency is a styling library (it changes the styling model).

## Repository inspection

Inspect the package manager and lockfile state (clean? current?), workspace layout, existing packages that might already solve the need (search `package.json` before npm), duplicate/near-duplicate libraries, peer-dependency constraints, the bundle analysis setup, license/security policy, and the removal path (is anything else importing the package?).

## Decision rules

- Decision ladder, in order: (1) browser primitive, (2) React built-in, (3) a dependency already in the tree, (4) a new dependency with written justification.
- New-dependency criteria, all four met: capability gap is real; maintenance is alive (releases, issues triaged); cost is acceptable (size vs value); exit path exists (replaceable API surface).
- Semver is a trust contract: `^`/`~` ranges plus a committed lockfile; upgrades are deliberate (`npm ci` in CI means the lockfile is the source of truth).
- Peer conflicts are resolved deliberately (align versions or pick the peer), never `-W`-forced into a broken graph.
- Behaviorally significant upgrades ship with migration notes and a changelog entry — the next reader must know why `left-pad`-scale assumptions changed.
- Removal is part of the lifecycle: unused dependencies are found and deleted (deps and their transitive orphans), not left as "probably still needed".
- Unrelated lockfile churn never rides in a feature PR — lockfile changes accompany the change that caused them.

## Implementation procedure

1. Search for the capability in-browser and in-repo first; write down what was rejected and why.
2. Evaluate candidates on the four criteria; record size impact (`npm info` + bundle report) and last-release health.
3. Install at the narrowest scope; let the lockfile capture the exact graph; commit it with the feature.
4. Verify: install from clean (`npm ci`), typecheck, tests, build, bundle-diff vs main.
5. Document behaviorally significant choices (migration notes for upgrades, justification for additions).
6. For removals: delete the dependency, prove no importer remains, run the clean-install verification again.

**Reference example** — the evaluation recorded as a decision, plus lockfile discipline:

```txt
Need: format dates relative to now ("3 days ago").

Ladder check:
(1) Browser primitive: Intl.RelativeTimeFormat — YES, does this natively.
(2) React built-in: n/a.  (3) Existing deps: date-fns@2 present — but Intl covers it.
DECISION: Intl.RelativeTimeFormat, zero new dependencies.

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
rtf.format(-3, "day");   // "3 days ago"
```

```txt
Upgrade PR: left-pad → replaced with String.prototype.padStart (Node/Browser 2017+).
- package.json: -1 dependency
- lockfile diff: only the removal subtree (no unrelated churn)
- bundle-diff: -483 B gzipped
- Migration note: padStart available in all supported browsers (checked caniuse)
```

Both examples cost a few minutes of writing and remove permanent rent — that is the whole discipline.

## Anti-patterns / failure modes

- Replacing working platform primitives with a package for convenience (`date-fns` where `Intl` suffices, `axios` where `fetch` + a 20-line wrapper suffices).
- Two libraries solving the same problem in one tree (two date libraries, two state managers) — picked by different authors at different times.
- `npm install -W`-forcing peer conflicts — the broken graph ships and detonates at the next upgrade.
- Unrelated lockfile churn smuggled in feature PRs — the audited artifact becomes unauditable.
- Upgrades without migration notes — behavioral changes (crypto APIs, default exports) discovered in production.
- Ignoring advisories because "it's devDependencies only" — build-time code executes in CI with your credentials.
- Deleting without proving no-importer — the runtime finds the orphan before the review does.

## Agent review checklist

- Was the ladder climbed in order, with the rejected rungs recorded?
- Are capability, maintenance, cost, and exit path all justified for additions?
- Is the lockfile change minimal and caused by this change only?
- Do peer constraints resolve deliberately?
- Do upgrades carry migration notes and a bundle-diff when runtime weight changes?
- For removals: is zero-import proven and clean-install verified?

## Verification

Clean-install check (`npm ci` passes), typecheck, tests, lint, and build; bundle or dependency report inspected when runtime weight changed; `npm ls <pkg>` shows a single consistent version (no dupes) unless consciously split; advisory scan passes with any exceptions documented.
