---
title: "iOS: Roll detail & inline editing"
labels: enhancement, ios
---

Full detail view with inline editing — no separate edit screen, save on field blur.

## Sections

1. **Header** — roll number (large), status badge, contact sheet thumbnail
2. **Camera & Film** — picker buttons → searchable sheets
3. **Dates** — shot at, lab at, scanned at (date pickers)
4. **Lab** — lab name text field, push/pull stepper (−3 … +3)
5. **Notes** — expanding `TextEditor`
6. **Tags** — tag chips + text field to add new tags
7. **Timestamps** — processed/uploaded/archived at (read-only, formatted)
8. **Danger zone** — "Delete roll" destructive button

## Tasks

- [ ] `RollDetailView` using `Form` with `Section`s
- [ ] Auto-save on field change with 0.5s debounce → `PATCH /api/rolls/:id`
- [ ] `CameraPickerSheet` — searchable list of user's cameras + "New camera" row
- [ ] `FilmPickerSheet` — searchable list of user's films + "New film" row
- [ ] `DatePicker` for shot/lab/scanned dates (compact style)
- [ ] `Stepper` for push/pull; display as `+2` / `−1` / `0` string
- [ ] `TextEditor` for notes, min height 80pt
- [ ] Tag input: `HStack` of chips + `TextField`; submit adds tag
- [ ] Contact sheet thumbnail (80×80 rounded) → full-screen viewer on tap
- [ ] Delete: confirmation alert → `DELETE /api/rolls/:id` → `NavigationStack.pop()`
- [ ] Show "Saving…" / "Saved ✓" indicator in nav bar trailing
