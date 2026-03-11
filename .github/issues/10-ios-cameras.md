---
title: "iOS: Cameras catalog & detail"
labels: enhancement, ios
---

Manage the user's camera collection.

## List view

- Brand + Model as title, nickname as subtitle
- Format badge: "35mm" / "120"
- Tap → detail; swipe → delete

## Detail view

- Inline-editable fields: brand, model, nickname, format (segmented control: 35mm / 120)
- Auto-save on blur → `PATCH /api/cameras/:id`
- Show rolls shot with this camera (count + list)

## Tasks

- [ ] `CamerasView` list with `NavigationLink` rows
- [ ] `CameraDetailView` with inline editing
- [ ] Auto-save with debounce
- [ ] "+" toolbar button → `NewCameraSheet` (brand, model, nickname, format)
- [ ] `POST /api/cameras` on create
- [ ] Swipe-to-delete with confirmation → `DELETE /api/cameras/:id`
- [ ] Search / filter by brand, model, nickname
- [ ] Handle cameras referenced by rolls (warn before delete if any rolls use it)
