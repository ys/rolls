---
title: "iOS: New roll creation sheet"
labels: enhancement, ios
---

`.sheet` for quickly logging a new roll with the minimum required fields.

## Fields

| Field | Required | Default |
|---|---|---|
| Roll number | Yes | next sequential number |
| Camera | No | — |
| Film | No | — |
| Shot date | No | today |
| Notes | No | — |

## Tasks

- [ ] `NewRollSheet` presented as `.sheet` from the "+" toolbar button + FAB equivalent
- [ ] Auto-suggest next roll number: `max(existing roll numbers) + 1` (handle non-numeric gracefully)
- [ ] Validate roll number is unique locally before submit
- [ ] Camera + film inline pickers (reuse `CameraPickerSheet` / `FilmPickerSheet`)
- [ ] "New camera" / "New film" inline creation inside picker sheets
- [ ] Submit → `POST /api/rolls` → dismiss sheet → insert new roll at top of list
- [ ] Keyboard: `submitLabel(.done)` on last field
- [ ] Error: show inline validation message if roll number conflict
