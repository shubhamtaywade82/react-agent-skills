---
name: frontend-documentation
description: Keep frontend README, API docs, Storybook, ADRs, migration notes and changelogs synchronized with behavior and public contract changes.
---

# Frontend Documentation

## Activate when

Activate when code changes public APIs, user-visible behavior, configuration, workflows, deployment, generated clients, component contracts or migration procedures.

## Repository inspection

Find README, package docs, Storybook, ADRs, changelog, migration docs, examples and generated documentation.

## Decision rules

Documentation is part of the contract for public or operational changes. Do not update docs with claims not supported by code/tests.

## Implementation contract

Map changed surface → affected docs → source-of-truth example → verification.

Prefer small examples that execute or are covered by tests when practical.

## Failure handling

Avoid stale examples, contradictory version instructions, undocumented breaking changes and generated docs drifting from source.

## Review

Check API names, commands, configuration, version statements and migration steps against current repository evidence.

## Verification

Run doc/example tests when present and inspect links/code examples for changed public surfaces.
