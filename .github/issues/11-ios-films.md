---
title: "iOS: Films catalog & detail"
labels: enhancement, ios
---

Manage film stocks, with catalog-assisted creation.

## List view

- Brand + Name as title, ISO + color/BW badge
- Tap → detail; swipe → delete

## Detail view

- Inline-editable: brand, name, nickname, ISO, color toggle, show-ISO toggle
- Auto-save on blur → `PATCH /api/films/:id`

## Catalog integration

- "New film" sheet includes a search field that queries `GET /api/catalog/films`
- Selecting a catalog entry pre-fills all fields
- User can still override any field before creating

## Tasks

- [ ] `FilmsView` list
- [ ] `FilmDetailView` with inline editing
- [ ] `NewFilmSheet` with catalog search (`GET /api/catalog/films?q=...`)
- [ ] `POST /api/films` on create
- [ ] Swipe-to-delete → `DELETE /api/films/:id`
- [ ] Color vs. B&W indicator icon in list row
