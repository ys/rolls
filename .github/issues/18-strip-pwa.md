---
title: "Strip PWA artifacts from web app (post-iOS launch)"
labels: enhancement, cleanup
---

Once the iOS app is stable on the App Store, remove PWA-specific code from the web app. The web app becomes a desktop/API companion — no longer a mobile-first PWA.

**Do NOT merge before the iOS app has been live for at least 2 weeks.**

## Tasks

### next.config.js & package.json
- [ ] Remove `next-pwa` plugin and config from `next.config.js`
- [ ] Remove `next-pwa` from `package.json` (and the `serialize-javascript` override)
- [ ] Delete generated `public/sw.js`, `public/workbox-*.js`

### App manifest
- [ ] Delete `app/manifest.ts`
- [ ] Remove `<link rel="manifest">` from `app/layout.tsx`

### Mobile meta tags
- [ ] Remove `apple-mobile-web-app-capable` and related meta tags from `app/layout.tsx`
- [ ] Keep `viewport-fit=cover` (still useful for Safari notch handling)
- [ ] Keep safe-area CSS (`env(safe-area-inset-*)`)

### Mobile-only components (web versions no longer needed)
- [ ] Remove `components/OfflineIndicator.tsx`
- [ ] Remove `components/PullToRefresh.tsx`
- [ ] Remove `components/SwipeNavigation.tsx`
- [ ] Remove `components/SwipeableListItem.tsx` (if mobile-only)
- [ ] Remove `hooks/useSwipeBack.ts`, `hooks/useSwipeNav.ts`

### Navigation
- [ ] Remove `components/BottomNav.tsx`
- [ ] Replace with a sidebar or top nav better suited to desktop
- [ ] Update all pages that import `BottomNav`

### Docs
- [ ] Update `CLAUDE.md` — remove PWA section, note web = desktop + CLI
- [ ] Update `lib/schema.sql` comment if anything changes

## Notes

The web app API routes (`/api/*`) are unchanged — the iOS app and CLI both use them.
