# Darkroom Minimalist UI Redesign

**Date:** 2026-03-12
**Status:** Approved
**Mockups:** `.superpowers/brainstorm/23181-1773312911/`

## Context

Redesign the rolls web app with a darkroom-inspired, aggressive minimalist aesthetic. The current design uses rounded corners, glassmorphic effects, and colorful status indicators. The new design embraces pure minimalism with dark backgrounds, sharp edges where appropriate, selective rounding, and amber as a "safelight" accent.

## Design Principles

1. **Darkroom aesthetic** — Dark gray background (#0f0f0f, not pure black), minimal lighting via amber accents
2. **Aggressive minimalism** — Remove unnecessary decoration, rely on spacing and typography
3. **Amber safelight** — Use #fbbf24 sparingly: active nav items, interactive states, edit mode indicators
4. **Selective rounding** — Bottom sheets get rounded tops (20px), images get subtle rounding (8px), FAB stays circular. Everything else sharp.
5. **Phosphor Icons** — Icon-only bottom nav, no text labels
6. **View/Edit separation** — Separate view mode (focused on contact sheet) from edit mode (metadata fields in bottom sheet)

---

## Global Styles

### Colors

```
Background: #0f0f0f (dark gray)
Card/Sheet background: #0a0a0a (slightly darker)
Border: #222 (subtle gray)
Text primary: #fff
Text secondary: #888
Text tertiary: #666
Text disabled: #444
Accent (amber): #fbbf24
Active field underline: #fbbf24
```

### Typography

- **Font:** iA Writer Mono (existing)
- **Uppercase labels:** 9px, letter-spacing 1px, color #666
- **Body text:** 11px
- **Headings:** 13-14px, font-weight 600

### Borders & Rounding

- **Borders:** 1px solid #222 (minimal, only where needed for structure)
- **Bottom sheets:** border-top-left-radius: 20px, border-top-right-radius: 20px
- **Contact sheets / images:** border-radius: 8px
- **FAB:** border-radius: 50% (circular)
- **Everything else:** No rounding (sharp edges)

### Icons

- **Library:** Phosphor Icons (existing)
- **Size:** 22px for nav icons, 26px for FAB, 12-18px for inline icons

---

## Bottom Navigation

### Layout

- Icon-only (no text labels)
- Icons vertically aligned to FAB center
- Fixed height: 64px
- Border-top: 1px solid #222
- 5 items: Rolls, Stats, FAB (+), Cameras, Settings

### Icons

```
Rolls: Image (Phosphor)
Stats: ChartLine (Phosphor)
FAB: Plus (Phosphor) — 48px circle, amber gradient background
Cameras: Camera (Phosphor)
Settings: Gear (Phosphor)
```

### Active State

- Color: #fbbf24 (amber)
- No background pill, no glow — just icon color change

---

## Page-by-Page Design

### 1. Roll List (Home)

**Header:**
- Title: "ROLLS" (left)
- Count: "24 ACTIVE" (right, #666)
- Border-bottom: 1px solid #222

**Roll Cards:**
- No borders, no rounded corners
- Padding: 1rem 0
- Left border: 2px solid (color based on status)
  - Active roll (most recent): #fbbf24
  - Other rolls: #444
- Content padding-left: 0.75rem
- Roll number: #fff, font-weight 600
- Camera + Film: #888, 10px, uppercase
- Status + Date: #666, 10px

**Layout:**
```
Border-left (2px amber/gray)
├─ 024 (white, bold)
├─ LEICA M6 • PORTRA 400 (gray)
└─ LAB • 2024-01-15 (dark gray)
```

---

### 2. Roll Detail — View Mode

**Header:**
- Back button (left, amber arrow icon)
- Roll number + Camera/Film (center)
  - "024" (#fff, bold)
  - "LEICA M6 • PORTRA 400" (#666, 9px)
- Edit icon (right, amber pencil icon)
- Border-bottom: 1px solid #222

**Contact Sheet:**
- For scanned rolls: Large image, border-radius: 8px
- For loaded rolls: Empty state
  - Camera icon (48px, #333)
  - "LOADED IN CAMERA" (#666)
  - "Contact sheet will appear after scanning" (#444, 9px)
- Takes flex: 1 (most of the space)

**Metadata Strip (bottom):**
- Border-top: 1px solid #222
- 3 columns: Status, Date, Notes
- Labels: #666, 8px, uppercase
- Values: #fff (status/date), #888 italic (notes)
- Notes: truncated with ellipsis

**Tap Contact Sheet:** Opens full-screen contact sheet view (optional)

---

### 3. Roll Detail — Edit Mode (Bottom Sheet)

**Trigger:** Tap edit icon in header

**Sheet Appearance:**
- Slides up from bottom
- View mode dims behind (opacity: 0.3)
- Background: #0a0a0a
- Border-top-left-radius: 20px
- Border-top-right-radius: 20px
- Border: 1px solid #222 (no bottom border)
- Max-height: 70%
- Scrollable if content overflows

**Sheet Header:**
- Handle: 40px x 3px, #333, border-radius: 2px, centered
- Cancel (left, #666) / "EDIT ROLL ###" (center, #fff bold) / SAVE (right, #fbbf24 bold)
- Border-bottom: 1px solid #222

**Fields (context-aware by status):**

**All rolls:**
- Camera (picker)
- Film (picker)
- Status (picker)
- Notes (text input, or tap "EXPAND" for full editor)

**Loaded/Fridge:**
- Loaded Date (date picker)
- Quick Actions:
  - "MARK AS LAB" (amber border button)
  - "ARCHIVE" (gray border button)

**Lab:**
- All above + Lab Date

**Scanned:**
- All above + Scanned Date

**Processed:**
- All above + Processed Date

**Archived:**
- All fields + Archived Date
- "ARCHIVE ROLL" button (gray)

**Field Layout:**
```
Label (9px uppercase, #666)
Value + Icon
─────────────────── (border-bottom: 1px #222)
```

**Active Field:**
- Currently editing field: border-bottom: 1px solid #fbbf24

**Unset Dates:**
- Display: "Not set" (#666)
- Icon: clock icon (#666)

---

### 4. Full-Frame Notes Editor

**Trigger:** Tap "EXPAND" next to Notes label in edit sheet

**Header:**
- Back + "BACK" (left, amber)
- "NOTES" / "ROLL ###" (center)
- "DONE" (right, amber bold)
- Border-bottom: 1px solid #222

**Editor:**
- Full-screen textarea
- Background: transparent
- Color: #fff
- Font: inherit (monospace)
- Font-size: 12px
- Line-height: 1.6
- Resize: none
- Outline: none
- Min-height: fills screen
- Placeholder: "Add notes about this roll..." (#666)

**Footer:**
- Border-top: 1px solid #222
- "MARKDOWN SUPPORTED" (left, #666, 9px)
- Character count (right, #666, 9px)

**Optional Toolbar:**
- Markdown formatting buttons (heading, list, bold)
- Icons: 18px, #666

**Optional Preview Tab:**
- Edit/Preview tabs above editor
- Active tab: #fbbf24, border-bottom: 2px solid #fbbf24
- Inactive tab: #666

**Behavior:**
- Auto-save on DONE
- No explicit save button

---

### 5. Full-Screen Contact Sheet (Optional)

**Trigger:** Tap contact sheet in view mode

**Header:**
- Back button (left, amber)
- Roll number (center)
- Border-bottom: 1px solid #222

**Content:**
- Contact sheet image fills screen
- Border-radius: 8px
- Background: #0a0a0a

**Future:** Tap individual frames to zoom/annotate

---

### 6. Settings Page

**Header:**
- "SETTINGS" (left)
- Border-bottom: 1px solid #222

**Groups:**
- Group label: #666, 9px uppercase, letter-spacing: 1px
- Vertical border-left: 1px solid #222, padding-left: 0.75rem
- Items:
  - Label (#fff)
  - Chevron right icon (#666, 12px)
  - Border-bottom: 1px solid #1a1a1a (subtle)

**Example:**
```
LIBRARY
│ Cameras  →
│ Films    →

DATA
│ Export   →
│ Import   →
```

---

### 7. Stats Page

**Header:**
- "STATS" (left)
- Year filter (right, #666, 10px)
- Border-bottom: 1px solid #222

**Stat Cards:**
- 2x2 grid
- Left border: 2px (amber for primary stat, #444 for others)
- Padding-left: 0.75rem
- Label: #666, 9px uppercase
- Value: #fff, 20px bold

**Charts:**
- Section label: #666, 9px uppercase
- Bar chart: minimal bars
  - Background: #1a1a1a
  - Active bar border-top: 2px solid #fbbf24
  - Others: 2px solid #333
- X-axis labels: #444, 8px

---

### 8. Cameras / Films List

**Header:**
- Back button (left, amber)
- Title (center)
- Count (right, #666)
- Border-bottom: 1px solid #222

**List:**
- Vertical border-left: 1px solid #222, padding-left: 0.75rem
- Item:
  - Name (#fff, bold)
  - Details (#666, 9px) — e.g., "35MM • 8 ROLLS"
  - Border-bottom: 1px solid #1a1a1a

---

### 9. Picker Sheets (Camera/Film/Status)

**Same as Edit Sheet but different content:**

**Header:**
- Handle
- "SELECT CAMERA" / "SELECT FILM" / "SELECT STATUS" (title)
- No Cancel/Save (dismiss by swipe or selection)

**Search:**
- Input field
- Border-bottom: 1px solid #222
- Background: transparent
- Color: #fff

**List:**
- Vertical border-left: 1px solid #222, padding-left: 0.75rem
- Items with chevron (no chevron if selecting)
- "+ Add New Camera/Film" (gray, with plus icon)

---

## Verification & Testing

### Visual Verification
1. Check all pages render with correct background colors (#0f0f0f)
2. Verify icon-only bottom nav with proper vertical alignment
3. Confirm amber accent only appears on active nav items
4. Test edit sheet slides up smoothly and dims background
5. Verify bottom sheet rounded top (20px) and sharp edges elsewhere
6. Check contact sheet and images have 8px border-radius
7. Verify all Phosphor icons render correctly

### Functional Testing
1. **Roll List:** Tap roll card opens roll detail view mode
2. **Roll Detail View:** Tap edit icon opens edit sheet
3. **Edit Sheet:**
   - Cancel dismisses sheet
   - Save persists changes and closes sheet
   - Tap Camera/Film/Status opens respective picker sheet
   - Tap date fields opens date picker
   - Field set adapts based on roll status (loaded vs lab vs scanned)
4. **Notes Expand:** Tap EXPAND opens full-frame editor
5. **Full-Frame Editor:** DONE saves and returns to edit sheet
6. **Contact Sheet:** Tap in view mode opens full-screen view
7. **Quick Actions:** "MARK AS LAB" updates status and adds lab_at timestamp

### Edge Cases
1. Loaded roll with no contact sheet shows camera icon placeholder
2. Unset date fields show "Not set" in gray
3. Long notes truncate with ellipsis in metadata strip
4. Empty notes show italic placeholder in strip

---

## Implementation Notes

### Key Files to Modify

**Styles:**
- `app/globals.css` — Update CSS variables, remove old rounded corners
- `tailwind.config.ts` — May need to adjust if using theme colors

**Components:**
- `components/BottomNav.tsx` — Remove text labels, align icons to FAB center
- `components/Sheet.tsx` — Already has rounded top, verify 20px radius
- `components/BackButton.tsx` — Already amber, keep as-is
- `app/roll/[id]/page.tsx` → `RollDetailClient.tsx` — Split view/edit modes
- New: `components/RollEditSheet.tsx` — Edit mode as bottom sheet
- New: `components/NotesEditor.tsx` — Full-frame notes editor
- `components/CameraPickerSheet.tsx` / `FilmPickerSheet.tsx` — Update styling to match new aesthetic

**Pages:**
- `app/page.tsx` → `HomeClient.tsx` — Update roll card styling
- `app/settings/page.tsx` — Update settings list styling
- `app/stats/page.tsx` — Update stat cards and chart styling
- `app/cameras/page.tsx` / `app/films/page.tsx` — Update list styling

### Progressive Enhancement
1. **Phase 1:** Global styles + bottom nav
2. **Phase 2:** Roll list + roll detail view mode
3. **Phase 3:** Edit sheet with context-aware fields
4. **Phase 4:** Full-frame notes editor
5. **Phase 5:** Remaining pages (settings, stats, cameras, films)

### Backwards Compatibility
- All functionality remains the same, only visual changes
- Existing data models unchanged
- API endpoints unchanged

---

## Open Questions / Future Enhancements

1. **Preview tab in notes editor** — Do we want Edit/Preview tabs or keep it simple?
2. **Markdown toolbar** — Do we show formatting shortcuts or rely on manual markdown?
3. **Contact sheet zoom** — Should full-screen view allow zooming individual frames?
4. **Quick actions** — Should we add more quick actions for other status transitions?
5. **Dark mode toggle** — This IS dark mode. Do we need a light mode option?

---

## References

- Mockups: `.superpowers/brainstorm/23181-1773312911/`
- Phosphor Icons: https://phosphoricons.com/
- Current codebase patterns: `CLAUDE.md`
