---
title: "iOS: Xcode project setup & CI"
labels: enhancement, ios
---

Bootstrap the Xcode project in this repo under `ios/`.

## Tasks

- [ ] Create Xcode project: `Rolls`, SwiftUI lifecycle, iOS 17 minimum deployment
- [ ] Bundle ID `computer.yannick.rolls`, manual signing (or Xcode Cloud)
- [ ] Commit `ios/Rolls.xcodeproj` to the repo (no `.xcworkspace` if no CocoaPods)
- [ ] Dependencies via Swift Package Manager only — no CocoaPods, no Carthage
  - No third-party deps needed initially; use system frameworks (`AuthenticationServices`, `PhotosUI`, `Charts`)
- [ ] `.gitignore` additions: `ios/DerivedData/`, `ios/*.xcuserstate`, `ios/xcshareddata/`
- [ ] GitHub Actions CI: build + test on every PR (`xcodebuild test` on `macos-latest` runner)
- [ ] `Makefile` target `make ios-build` for local sanity checks
- [ ] Add `ios/` note to `CLAUDE.md`

## Notes

Target iPhone only for now — no iPad-specific layout needed yet.
