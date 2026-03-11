# iOS Transition Issues

Markdown source files for the GitHub issues that plan the native iOS app transition.

## Create all issues at once

```sh
# Requires gh CLI: https://cli.github.com
gh auth login

for f in .github/issues/[0-9]*.md; do
  title=$(grep '^title:' "$f" | sed 's/^title: *"\(.*\)"$/\1/')
  labels=$(grep '^labels:' "$f" | sed 's/^labels: *//')
  body=$(awk '/^---/{c++; if(c==2){found=1; next}} found' "$f")
  gh issue create --title "$title" --label "$labels" --body "$body"
done
```

Or create them individually:

```sh
gh issue create --title "Native iOS app: transition from PWA" \
  --label "enhancement" \
  --body-file .github/issues/01-ios-epic.md
```

## Issue order

| File | Title |
|---|---|
| 01-ios-epic.md | Native iOS app: transition from PWA (tracking issue) |
| 02-ios-xcode-setup.md | Xcode project setup & CI |
| 03-ios-api-client.md | API client & Keychain token storage |
| 04-ios-passkey-auth.md | Passkey authentication |
| 05-ios-data-models.md | Swift data models |
| 06-ios-home-list.md | Home / rolls list |
| 07-ios-roll-detail.md | Roll detail & inline editing |
| 08-ios-new-roll.md | New roll creation sheet |
| 09-ios-archive.md | Archive view |
| 10-ios-cameras.md | Cameras catalog |
| 11-ios-films.md | Films catalog |
| 12-ios-stats.md | Stats view |
| 13-ios-settings.md | Settings & API key management |
| 14-ios-contact-sheet.md | Contact sheet photo picker & upload |
| 15-ios-offline.md | Offline caching & sync |
| 16-ios-polish.md | Haptics, animations & polish |
| 17-ios-testflight.md | TestFlight & App Store submission |
| 18-strip-pwa.md | Strip PWA from web app (post-launch) |
