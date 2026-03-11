---
title: "iOS: Home / rolls list"
labels: enhancement, ios
---

Main tab — scrollable list of active (non-archived) rolls, newest first.

## Layout

- Large nav title "Rolls"
- Each row: roll number · date · camera nickname · film name · status badge
- Status badge colour: amber = fridge/loaded, blue = lab, teal = scanned, green = processed+
- Swipe trailing → "Archive" action
- Tap row → Roll detail
- Toolbar "+" → New roll sheet

## Tasks

- [ ] `RollListView` with `List` + `ForEach`
- [ ] `RollRowView` component (reused in Archive too)
- [ ] `StatusBadgeView` (reused everywhere)
- [ ] Pull-to-refresh via `.refreshable { await store.fetch() }`
- [ ] Empty state: illustration + "Log your first roll" button → new roll sheet
- [ ] Trailing swipe action: archive → `POST /api/rolls/archive`
- [ ] Skeleton placeholder rows while fetching (first load)
- [ ] Error banner on API failure with retry button
