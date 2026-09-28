---
name: browser-media
description: Integrate browser media APIs with permission, autoplay, capability, device and cleanup contracts.
---

# Browser Media

## Activate when

Activate for camera, microphone, audio/video playback, MediaDevices, permissions, MediaRecorder or WebRTC-adjacent UI.

## Repository inspection

Inspect permission flow, secure-context requirements, device selection, track ownership, autoplay policy and cleanup.

## Decision rules

Treat media access as privileged browser capability. Ask for permission at the user-driven action that needs it and release tracks promptly.

## Implementation contract

capability detection → permission → acquisition → active → stop/error

Handle unsupported browsers and denied permissions explicitly.

## Failure handling

Cover permission denial, no device, device loss, autoplay refusal, secure-context failure and cleanup on navigation/unmount.

## Review

Check permission UX, indicators, privacy, track cleanup and sensitive data handling.

## Verification

Use real-browser tests where supported; otherwise test capability/permission state transitions through controlled fakes.
