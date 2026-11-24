---
name: typescript-configuration
description: Use when changing tsconfig files, compiler flags, module resolution, JSX settings, declarations, project references, or strictness — compiler configuration as an explicit compatibility and build contract.
license: MIT
---

# TypeScript Configuration

## Purpose

Compiler configuration is a compatibility contract, not a preferences file: it decides what the language rejects, what JavaScript the build emits, how modules resolve, and what the editor shows every developer. Change the narrowest config that owns the required behavior, keep dev/build/test paths in agreement, and never weaken strictness globally to make local errors disappear — a silenced type error is a production bug with a build badge.

## Activate when

- changing tsconfig flags, strictness, or JSX settings;
- resolving module-resolution or emits-mismatch problems (bundler vs node16/node18);
- introducing or repairing project references, composite builds, or declaration output;
- aligning editor behavior with build behavior, or test config with app config;
- documenting why a non-default compiler option exists.

## Repository inspection

Inspect all tsconfig variants (`tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, test configs), the `extends` chain, `project references`, the bundler's TypeScript handling (Vite/esbuild/swc transpile-only vs `tsc` typecheck), `package.json` module format (`type: module`), and the exact CI typecheck/build commands. The effective config is the merge result along the extends chain — read it as a whole, not file by file.

## Decision rules

- The narrowest owning config wins: app flags in the app config, build-tool flags in the build config, shared invariants in the base.
- Strictness is a floor, not a dial: `strict: true` stays; targeted suppression (`@ts-expect-error` with a reason) beats global weakening.
- Module resolution must match the consumer: bundler-resolved apps use `"moduleResolution": "bundler"`; Node-emitted libraries use `"node16"`/`"nodenext"` — the wrong one compiles and breaks at runtime.
- Emitted JavaScript semantics matter, not just typechecking: `useDefineForClassFields`, `target`, and `verbatimModuleSyntax` change runtime behavior.
- Editor and build must run the same effective config; divergence produces "works in my IDE" bugs.
- Declaration output is a public contract: changing `declaration`, `declarationMap`, or `importsNotUsedAsValues`/`verbatimModuleSyntax` changes what consumers compile against.

## Implementation procedure

1. Identify which config file owns the behavior you need (walk the extends chain).
2. Change the flag there; write the reason next to it as a comment.
3. Recompute the effective config for dev, test, and build paths; diff them mentally — they must agree on strictness and resolution.
4. Run `tsc --noEmit` (or the repo's typecheck) plus the build; for libraries, inspect emitted declarations.
5. Check `tsc --showConfig` to verify the merge result if behavior surprises you.

**Reference example** — a strict base with app/node splits, and the resolution trap:

```jsonc
// tsconfig.base.json — invariants every package inherits
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,   // arr[i] is T | undefined — catches the classic crash
    "verbatimModuleSyntax": true,       // `import type` is enforced, emit is ESM-correct
    "target": "ES2022",
    "useDefineForClassFields": true     // aligns class fields with JS runtime semantics
  }
}

// tsconfig.app.json — browser app, bundler-resolved (Vite)
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "moduleResolution": "bundler",      // allows extensionless relative imports the bundler resolves
    "jsx": "react-jsx",                 // runtime automatic JSX — no React import needed
    "noEmit": true                      // Vite/esbuild emit; tsc only typechecks
  }
}

// tsconfig.node.json — build scripts and server-side config running in real Node
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "module": "node18",                 // real Node resolution: extensions REQUIRED
    "moduleResolution": "node18"
  }
}
```

The classic failure this split prevents: `"moduleResolution": "bundler"` in the Node config makes `import "./util"` compile, then crash at runtime with `ERR_MODULE_NOT_FOUND` — the bundler's tolerance is not Node's behavior.

## Anti-patterns / failure modes

- `strict: false` or dropping individual strict flags to clear errors — the errors were the product working.
- Disabling `noUnusedLocals`/`noUnusedParameters` repo-wide to silence one file.
- Copying a `tsconfig` from a template without knowing which path (dev/build/test) owns it — dev/build divergence follows.
- `skipLibCheck: true` as a fix for real type errors in dependencies (it only skips .d.ts checking — knowing what it does is fine, hiding behind it is not).
- Changing `module`/`moduleResolution` without checking every import's extension and the package's `exports` map.
- Declaring output changes (new public types, removed emitted files) shipped as if they were internal.
- Test config allowed to drift from app config — tests pass under looser strictness than production uses.

## Verification

Run the repository typecheck, build, and declaration generation where applicable, plus affected test suites. Concretely: (a) `tsc --showConfig` for each path shows the intended effective merge; (b) dev, test, and build disagree on nothing strictness- or resolution-related; (c) library builds emit the expected declarations and consumers (or the API extractor) still compile; (d) the module-resolution change is exercised by a real runtime entry (Node script or bundler build), not just a clean typecheck.

## Source foundation

- tsconfig reference (every flag): https://www.typescriptlang.org/tsconfig
- Project references and composite builds: https://www.typescriptlang.org/docs/handbook/project-references.html
- Modules reference (module/moduleResolution deep dive): https://www.typescriptlang.org/docs/handbook/modules/reference
- `tsc --showConfig` and compiler options in CLI: https://www.typescriptlang.org/docs/handbook/compiler-options
