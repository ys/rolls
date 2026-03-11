---
title: "iOS: Archive view"
labels: enhancement, ios
---

Second tab — archived rolls, grouped by year, searchable.

## Tasks

- [ ] `ArchiveView` with same `RollRowView` as home list
- [ ] Sections by year (descending) using `List` with section headers
- [ ] Trailing swipe action: "Unarchive" → `POST /api/rolls/archive`
- [ ] `searchable` modifier filtering by roll number, camera/film name, notes
- [ ] Pull-to-refresh
- [ ] Empty state: "No archived rolls yet"
- [ ] Badge on tab icon showing archived count (optional — skip if noisy)
