# React 19 API Selection

Use this reference after repository inspection when choosing among React 19 APIs.

| API | Use when | Gate |
| --- | --- | --- |
| Activity | Hide/preserve UI trees and their state across visibility changes | React 19.2+ and framework/renderer support |
| useEffectEvent | Separate non-reactive logic from an effect's reactive dependencies | React 19.2+ |
| cacheSignal | Coordinate cache lifetime with server rendering/cache semantics | React 19.2+ and supported server runtime |
| ViewTransition | Coordinate DOM transitions around supported React transitions/navigation | React 19.3+ and renderer/framework support |
| Fragment Refs | Observe or interact with descendant DOM through a Fragment ref | React 19.3+ and renderer/browser support |
| browser() | Access browser-specific behavior through the supported React runtime contract | Verify framework/runtime support first |
| use | Consume supported promises/context in the supported render model | Verify React and renderer semantics first |

## Selection rule

Do not migrate an existing stable implementation merely because a newer API exists. First establish:

1. installed `react` and `react-dom` versions;
2. framework/runtime support;
3. server/client boundary;
4. browser requirement;
5. accessibility and reduced-motion impact;
6. focused verification strategy.

For transition/ref APIs, browser-level verification is part of the contract.
