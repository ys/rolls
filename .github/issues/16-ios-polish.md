---
title: "iOS: Haptics, animations & polish"
labels: enhancement, ios
---

Make the app feel noticeably more physical and immediate than the PWA — this is the whole point of going native.

## Haptics

| Trigger | Generator | Style |
|---|---|---|
| Tab switch | `UIImpactFeedbackGenerator` | `.light` |
| Row tap | `UIImpactFeedbackGenerator` | `.light` |
| Swipe action commit (archive, delete) | `UIImpactFeedbackGenerator` | `.medium` |
| Save success | `UINotificationFeedbackGenerator` | `.success` |
| Upload complete | `UINotificationFeedbackGenerator` | `.success` |
| API error | `UINotificationFeedbackGenerator` | `.error` |

## Animations

- [ ] List row insert/remove: `.animation(.spring(response: 0.35))` on `ForEach`
- [ ] Status badge colour transition: `.animation(.easeInOut(duration: 0.2))`
- [ ] Contact sheet thumbnail fade-in after load
- [ ] Sheet presentations use default SwiftUI spring (no custom needed)
- [ ] Stats chart bars animate in on view appear

## Visual polish

- [ ] Accent colour `#FF9500` (orange) — matches web app
- [ ] Dark mode: respect `@Environment(\.colorScheme)`; status badges readable in both modes
- [ ] App icon: use existing 1024×1024 asset from `/api/apple-touch-icon`
- [ ] `AsyncImage` with skeleton placeholder (rounded rect, shimmer optional)
- [ ] Consistent corner radius: 10pt for cards, 8pt for badges
- [ ] Safe area padding at bottom (tab bar overlaps content otherwise)
