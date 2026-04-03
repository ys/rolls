---
title: "iOS: Stats view"
labels: enhancement, ios
---

Analytics tab using Swift Charts.

## Content

| Widget | Data source |
|---|---|
| Total rolls / cameras / films | local stores |
| Rolls per year (bar chart) | rolls grouped by `shot_at` year |
| Rolls per camera (horizontal bar) | rolls grouped by `camera_uuid` |
| Rolls per film stock (horizontal bar) | rolls grouped by `film_uuid` |
| Most-used lab | rolls grouped by `lab_name` |

## Tasks

- [ ] `StatsView` aggregating data from `RollStore`, `CameraStore`, `FilmStore` (no new API needed)
- [ ] Summary cards row: total rolls, cameras, films
- [ ] `Chart { BarMark }` for rolls per year
- [ ] Horizontal `Chart { BarMark }` for top 5 cameras / films
- [ ] Animate bars on appear (`.animation(.easeOut, value: loaded)`)
- [ ] Empty state when no rolls exist
- [ ] Handle rolls with no camera / film (group as "Unknown")
