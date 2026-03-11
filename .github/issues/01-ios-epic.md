---
title: "Native iOS app: transition from PWA"
labels: enhancement
---

## Why

The PWA has two fundamental iOS limitations that can't be fixed in a web context:

- **Uncontrollable zoom** — iOS Safari ignores `user-scalable=no` for accessibility reasons; double-tap and pinch zoom fire on form inputs and content regardless
- **Lack of snappiness** — WKWebView adds a rendering layer; scroll physics, animations, and gesture response never feel as fluid as native UIKit/SwiftUI

A native SwiftUI app gives us real UIScrollView physics, instant haptics, native gesture recognizers, and full control of every transition.

## Approach

- SwiftUI app (iOS 17+), talking to the existing REST API (`/api/*` endpoints, unchanged)
- Passkey auth via `ASAuthorization` — native WebAuthn support since iOS 16
- API key stored in Keychain; bearer-token auth on every request
- Keep the web app as-is for desktop/browser access; strip PWA manifest artifacts post-launch

## Sub-issues

- [ ] #02 Xcode project setup & CI
- [ ] #03 API client & Keychain token storage
- [ ] #04 Passkey authentication (native WebAuthn)
- [ ] #05 Swift data models
- [ ] #06 Home / rolls list
- [ ] #07 Roll detail & inline editing
- [ ] #08 New roll creation
- [ ] #09 Archive view
- [ ] #10 Cameras catalog
- [ ] #11 Films catalog
- [ ] #12 Stats view
- [ ] #13 Settings & API key management
- [ ] #14 Contact sheet photo picker & upload
- [ ] #15 Offline caching & sync
- [ ] #16 Haptics, animations & polish
- [ ] #17 TestFlight & App Store submission
- [ ] #18 Strip PWA from web app (post-launch)
