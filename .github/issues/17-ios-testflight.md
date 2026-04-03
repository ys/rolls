---
title: "iOS: TestFlight & App Store submission"
labels: enhancement, ios
---

Distribute the app via TestFlight for internal testing, then submit to the App Store.

## Pre-submission checklist

- [ ] Apple Developer account: register bundle ID `computer.yannick.rolls`
- [ ] Associated Domains entitlement configured: `webcredentials:rolls.yannick.computer`
- [ ] `Info.plist` usage descriptions:
  - `NSPhotoLibraryUsageDescription` — "To attach contact sheets to your rolls"
  - `NSCameraUsageDescription` — "To photograph contact sheets"
- [ ] Privacy manifest (`PrivacyInfo.xcprivacy`) — required for App Store as of Spring 2024:
  - Declare: `UserDefaults`, `FileTimestamp` (if using file dates), network access
- [ ] Launch screen (simple: orange background + "Rolls" wordmark)
- [ ] App icon set (all required sizes generated from 1024×1024 source)

## Distribution

- [ ] Archive via Xcode → upload to App Store Connect
- [ ] TestFlight internal group: self-test for at least one full roll workflow
- [ ] External TestFlight (optional): invite a handful of beta users
- [ ] App Store metadata:
  - Name: "Rolls"
  - Subtitle: "Analog film tracker"
  - Description: focus on film photographers managing roll history
  - Screenshots: 6.7" Pro Max required; 5.5" recommended
  - Keywords: film photography, analog, roll, 35mm, medium format
- [ ] App Review notes: provide demo account credentials + steps to reproduce key flows
