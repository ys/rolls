---
title: "iOS: Contact sheet photo picker & upload"
labels: enhancement, ios
---

Upload a contact sheet image from Photos or Camera directly in the roll detail view.

## Flow

1. Tap contact sheet placeholder (or thumbnail) in roll detail
2. `PhotosPicker` presents (or action sheet: Photos / Camera)
3. Selected image resized to max 2000px wide, converted to JPEG (WebP not writable via `ImageIO` on iOS)
4. Upload via `PUT /api/rolls/:id/contact-sheet` as multipart/form-data with progress indicator
5. On success: `contactSheetUrl` updates in store → thumbnail appears

## Tasks

- [ ] `PhotosPicker` from `PhotosUI` framework
- [ ] Image resizing using `vImage` or `UIGraphicsImageRenderer`
- [ ] Multipart upload with `URLSessionUploadTask` + `URLSession.bytes` for progress
- [ ] Circular progress indicator overlaid on thumbnail during upload
- [ ] Full-screen viewer: `AsyncImage` in `.fullScreenCover` with pinch-to-zoom (`MagnificationGesture`)
- [ ] "Remove contact sheet" option (long press or context menu) — `DELETE` or `PUT` with empty body TBD with API
- [ ] Handle permission denied: show Settings deep-link alert

## Notes

The server endpoint (`PUT /api/rolls/:id/contact-sheet`) currently stores to Cloudflare R2 as `{roll_number}.webp`. The iOS app can upload JPEG; the server re-encodes or stores as-is — verify server behaviour.
