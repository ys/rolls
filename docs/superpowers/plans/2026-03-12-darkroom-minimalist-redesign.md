# Darkroom Minimalist UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the rolls web app UI with a darkroom-inspired, aggressive minimalist aesthetic featuring dark backgrounds, icon-only navigation, and amber safelight accents.

**Architecture:** Visual-only redesign preserving all existing functionality. Updates global styles, removes glassmorphic effects and rounded corners (except selective cases), implements icon-only bottom nav, splits roll detail into view/edit modes with bottom sheet, and adds full-frame notes editor.

**Tech Stack:** Next.js 15, React, Tailwind CSS, Phosphor Icons (existing), TypeScript

**Spec:** `docs/superpowers/specs/2026-03-12-darkroom-minimalist-redesign.md`
**Mockups:** `.superpowers/brainstorm/23181-1773312911/`

---

## Chunk 1: Phase 1 - Global Styles & Bottom Nav

### Task 1: Update Global CSS Variables and Animations

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add darkroom color variables to globals.css**

Add after font-face declarations, before html selector:

```css
:root {
  /* Darkroom color palette */
  --darkroom-bg: #0f0f0f;
  --darkroom-card: #0a0a0a;
  --darkroom-border: #222;
  --darkroom-border-subtle: #1a1a1a;
  --darkroom-text-primary: #fff;
  --darkroom-text-secondary: #888;
  --darkroom-text-tertiary: #666;
  --darkroom-text-disabled: #444;
  --darkroom-accent: #fbbf24;
}
```

- [ ] **Step 2: Update body styles for dark background**

Replace existing body styles with:

```css
body {
  overflow-x: clip;
  max-width: 100%;
  font-family: "iA Writer Mono", ui-monospace, monospace;
  background-color: var(--darkroom-bg);
  color: var(--darkroom-text-primary);
}
```

- [ ] **Step 3: Remove nav flip animations (no longer needed)**

Delete the nav flip animations section (lines 50-66):
- `@keyframes navFlipOut`
- `@keyframes navFlipIn`
- `@keyframes editBarFlipIn`
- `@keyframes editBarFlipOut`

- [ ] **Step 4: Test visual changes**

Run: `npm run dev`
Navigate to: `http://localhost:3000`
Expected: Page background is now dark gray (#0f0f0f), text is white

- [ ] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "feat: add darkroom color palette and update body background"
```

---

### Task 2: Update Bottom Navigation to Icon-Only

**Files:**
- Modify: `app/BottomNav.tsx:1-116`

- [ ] **Step 1: Update icon imports**

Replace line 7 with correct Phosphor icons:

```typescript
import { Image, Archive, ChartLine, Gear, Plus, Camera } from "@phosphor-icons/react";
```

- [ ] **Step 2: Update TABS array with correct icons**

Replace lines 11-16:

```typescript
const TABS = [
  { href: "/",         icon: Image,     match: (p: string) => p === "/" || p.startsWith("/roll/") },
  { href: "/stats",    icon: ChartLine, match: (p: string) => p === "/stats" },
  { href: "/cameras",  icon: Camera,    match: (p: string) => p.startsWith("/cameras") || p.startsWith("/films") },
  { href: "/settings", icon: Gear,      match: (p: string) => p.startsWith("/settings") },
];
```

Note: Removed `label` property, removed Archive tab (consolidating to 4 tabs + FAB)

- [ ] **Step 3: Remove glassmorphic styles and update nav container**

Replace the nav container (lines 56-68) with new darkroom styling:

```tsx
<nav
  className="fixed bottom-0 inset-x-0 z-50 flex justify-center items-center gap-0 pointer-events-none"
  style={{
    paddingBottom: "calc(env(safe-area-inset-bottom))",
    height: 64,
  }}
>
  {/* Icon container */}
  <div
    className="pointer-events-auto flex items-center justify-around border-t"
    style={{
      ...animStyle,
      width: "100%",
      maxWidth: "42rem",
      height: 64,
      borderColor: "var(--darkroom-border)",
      backgroundColor: "var(--darkroom-bg)",
    }}
  >
    {TABS.map(({ href, icon: Icon, match }) => {
      const active = match(pathname);
      return (
        <Link
          key={href}
          href={href}
          prefetch={true}
          aria-label={href.slice(1) || "rolls"}
          onClick={() => haptics.light()}
          className="relative flex items-center justify-center transition-colors duration-200 active:scale-90"
          style={{ width: 60, height: 64 }}
        >
          <Icon
            size={22}
            weight={active ? "fill" : "regular"}
            style={{ color: active ? "var(--darkroom-accent)" : "var(--darkroom-text-tertiary)" }}
          />
        </Link>
      );
    })}

    {/* FAB in center position */}
    <Link
      href="/new"
      aria-label="New roll"
      onClick={() => haptics.medium()}
      className="absolute left-1/2 flex-shrink-0 flex items-center justify-center rounded-full active:scale-90 transition-transform"
      style={{
        ...animStyle,
        width: 48,
        height: 48,
        marginLeft: -24,
        top: "50%",
        marginTop: -24,
        background: "var(--darkroom-accent)",
        boxShadow: "0 4px 12px rgba(251, 191, 36, 0.3)",
      }}
    >
      <Plus size={26} weight="bold" color="#000" />
    </Link>
  </div>
</nav>
```

- [ ] **Step 4: Test bottom nav**

Run: `npm run dev`
Expected:
- Icon-only nav with no text labels
- 4 icons + center FAB
- Icons aligned to center (height: 64px)
- Active icon shows amber color
- FAB is circular, 48px, amber background

- [ ] **Step 5: Commit**

```bash
git add app/BottomNav.tsx
git commit -m "feat: convert bottom nav to icon-only with darkroom styling"
```

---

## Chunk 2: Phase 2 - Roll List & Roll Detail View Mode

### Task 3: Update Roll List Styling

**Files:**
- Modify: `app/HomeClient.tsx:1-200`

- [ ] **Step 1: Remove film gradient stripe logic**

In HomeClient.tsx, find the RollItem component and update the card styling to use left border instead of gradient stripe.

Replace lines 88-98 (stripe logic and rendering) with:

```typescript
const status = rollStatus(roll);
const next = editing ? undefined : STATUS_NEXT[status];
const dateStr = roll.shot_at
  ? new Date(roll.shot_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
  : null;
const cam = cameraLabel(roll);
const film = filmLabel(roll);
const notePreview = firstNotesLine(roll.notes);

// Determine if this is the most recent active roll
const isRecent = !editing && roll.id === rolls[0]?.id;
const borderColor = isRecent ? "var(--darkroom-accent)" : "#444";
```

- [ ] **Step 2: Update roll card markup for minimal style**

Replace the card rendering (starting around line 94) with:

```tsx
const cardBase = "py-4 border-l-2";

const mainContent = (
  <>
    {editing && <Checkbox checked={selected} />}
    <div className="flex-1 min-w-0 pl-3">
      <div className="font-semibold" style={{ color: "var(--darkroom-text-primary)" }}>
        {roll.number}
      </div>
      <div className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: "var(--darkroom-text-secondary)" }}>
        {cam && film ? `${cam} • ${film}` : cam || film || "—"}
      </div>
      <div className="text-[10px] mt-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
        {status.toUpperCase()}
        {dateStr && ` • ${dateStr}`}
      </div>
      {!editing && notePreview && (
        <div className="text-[10px] italic mt-1 truncate" style={{ color: "var(--darkroom-text-tertiary)" }}>
          {notePreview}
        </div>
      )}
    </div>
    {!editing && next && (
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdvance(next.field); }}
        className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-md transition-colors active:scale-95"
        style={{
          color: "var(--darkroom-text-primary)",
          backgroundColor: "transparent",
          border: `1px solid var(--darkroom-border)`,
        }}
      >
        {next.label}
      </button>
    )}
  </>
);

return (
  <div
    className={cardBase}
    style={{ borderColor }}
  >
    {editing ? (
      <div className="flex items-start gap-3 px-4" onClick={onToggle}>
        {mainContent}
      </div>
    ) : (
      <Link href={`/roll/${roll.id}`} className="flex items-start gap-3 px-4 active:bg-zinc-900/30">
        {mainContent}
      </Link>
    )}
  </div>
);
```

- [ ] **Step 3: Update header styling**

Find the header section in HomeClient and update to darkroom style:

```tsx
<div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
  <h1 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--darkroom-text-primary)" }}>
    ROLLS
  </h1>
  <div className="text-xs" style={{ color: "var(--darkroom-text-tertiary)" }}>
    {rolls.length} ACTIVE
  </div>
</div>
```

- [ ] **Step 4: Test roll list**

Run: `npm run dev`
Navigate to: `http://localhost:3000`
Expected:
- Roll cards have no borders or rounding
- Left border: 2px, amber for first roll, #444 for others
- Text styling matches spec (uppercase camera/film, smaller status/date)
- No film gradient stripes

- [ ] **Step 5: Commit**

```bash
git add app/HomeClient.tsx
git commit -m "feat: update roll list with minimal darkroom styling"
```

---

### Task 4: Create Roll Detail View Mode Component

**Files:**
- Create: `app/roll/[id]/RollDetailView.tsx`
- Modify: `app/roll/[id]/RollDetailClient.tsx:1-50`

- [ ] **Step 1: Create RollDetailView component**

Create new file `app/roll/[id]/RollDetailView.tsx`:

```typescript
"use client";

import { Camera, PencilSimple } from "@phosphor-icons/react";
import { BackButton } from "@/components/BackButton";
import type { Roll } from "@/lib/db";
import { rollStatus } from "@/lib/status";

interface RollDetailViewProps {
  roll: Roll & {
    camera_nickname: string | null;
    camera_brand: string | null;
    camera_model: string | null;
    film_nickname: string | null;
    film_brand: string | null;
    film_name: string | null;
    film_iso: number | null;
    film_show_iso: boolean | null;
  };
  contactSheetUrl: string | null;
  onEdit: () => void;
}

function cameraLabel(roll: RollDetailViewProps["roll"]): string {
  if (roll.camera_nickname) return roll.camera_nickname;
  if (roll.camera_brand && roll.camera_model) return `${roll.camera_brand} ${roll.camera_model}`;
  return "";
}

function filmLabel(roll: RollDetailViewProps["roll"]): string {
  if (roll.film_nickname) return roll.film_nickname;
  if (roll.film_brand && roll.film_name) {
    const iso = roll.film_show_iso && roll.film_iso ? ` ${roll.film_iso}` : "";
    return `${roll.film_brand} ${roll.film_name}${iso}`;
  }
  return "";
}

export function RollDetailView({ roll, contactSheetUrl, onEdit }: RollDetailViewProps) {
  const status = rollStatus(roll);
  const cam = cameraLabel(roll);
  const film = filmLabel(roll);

  const dateField =
    roll.archived_at ? roll.archived_at :
    roll.processed_at ? roll.processed_at :
    roll.scanned_at ? roll.scanned_at :
    roll.lab_at ? roll.lab_at :
    roll.loaded_at;

  const dateStr = dateField
    ? new Date(dateField).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : null;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--darkroom-bg)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
        <BackButton />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm" style={{ color: "var(--darkroom-text-primary)" }}>
            {roll.number}
          </div>
          <div className="text-[9px] uppercase tracking-wide mt-0.5" style={{ color: "var(--darkroom-text-tertiary)" }}>
            {cam && film ? `${cam} • ${film}` : cam || film || "—"}
          </div>
        </div>
        <button
          onClick={onEdit}
          className="p-2 active:scale-90 transition-transform"
          aria-label="Edit roll"
        >
          <PencilSimple size={18} weight="regular" style={{ color: "var(--darkroom-accent)" }} />
        </button>
      </div>

      {/* Contact Sheet or Empty State */}
      <div className="flex-1 px-4 py-6">
        {contactSheetUrl ? (
          <img
            src={contactSheetUrl}
            alt={`Contact sheet for roll ${roll.number}`}
            className="w-full h-auto"
            style={{ borderRadius: 8 }}
          />
        ) : (
          <div
            className="h-full flex flex-col items-center justify-center"
            style={{ backgroundColor: "var(--darkroom-card)", borderRadius: 8, border: `1px solid var(--darkroom-border-subtle)` }}
          >
            <Camera size={48} weight="thin" style={{ color: "#333" }} />
            <div className="mt-4 text-xs font-medium tracking-wide" style={{ color: "var(--darkroom-text-tertiary)" }}>
              LOADED IN CAMERA
            </div>
            <div className="mt-1 text-[9px]" style={{ color: "var(--darkroom-text-disabled)" }}>
              Contact sheet will appear after scanning
            </div>
          </div>
        )}
      </div>

      {/* Metadata Strip */}
      <div className="flex gap-6 px-4 py-3 border-t" style={{ borderColor: "var(--darkroom-border)" }}>
        <div className="flex-1">
          <div className="text-[8px] uppercase tracking-wider mb-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
            Status
          </div>
          <div className="text-[10px]" style={{ color: "var(--darkroom-text-primary)" }}>
            {status}
          </div>
        </div>
        <div className="flex-1">
          <div className="text-[8px] uppercase tracking-wider mb-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
            Date
          </div>
          <div className="text-[10px]" style={{ color: "var(--darkroom-text-primary)" }}>
            {dateStr || "—"}
          </div>
        </div>
        <div className="flex-[2] min-w-0">
          <div className="text-[8px] uppercase tracking-wider mb-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
            Notes
          </div>
          <div className="text-[10px] italic truncate" style={{ color: "var(--darkroom-text-secondary)" }}>
            {roll.notes || "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update RollDetailClient to use view component**

Modify `app/roll/[id]/RollDetailClient.tsx` to import and render RollDetailView initially:

```typescript
"use client";

import { useState } from "react";
import { RollDetailView } from "./RollDetailView";
import type { Roll } from "@/lib/db";

interface RollDetailClientProps {
  roll: Roll & {
    camera_nickname: string | null;
    camera_brand: string | null;
    camera_model: string | null;
    film_nickname: string | null;
    film_brand: string | null;
    film_name: string | null;
    film_iso: number | null;
    film_show_iso: boolean | null;
  };
  contactSheetUrl: string | null;
}

export default function RollDetailClient({ roll, contactSheetUrl }: RollDetailClientProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    // TODO: Render edit sheet in Phase 3
    return <div>Edit mode - TODO</div>;
  }

  return (
    <RollDetailView
      roll={roll}
      contactSheetUrl={contactSheetUrl}
      onEdit={() => setIsEditing(true)}
    />
  );
}
```

- [ ] **Step 3: Test roll detail view mode**

Run: `npm run dev`
Navigate to: `http://localhost:3000` → click a roll
Expected:
- Header with back button, roll number, camera/film, edit icon (amber)
- Contact sheet with 8px border-radius (if scanned)
- Empty state with camera icon (if loaded)
- Metadata strip at bottom with 3 columns

- [ ] **Step 4: Commit**

```bash
git add app/roll/[id]/RollDetailView.tsx app/roll/[id]/RollDetailClient.tsx
git commit -m "feat: add roll detail view mode with minimal darkroom styling"
```

---

## Chunk 3: Phase 3 - Edit Sheet with Context-Aware Fields

### Task 5: Create Roll Edit Sheet Component

**Files:**
- Create: `components/RollEditSheet.tsx`
- Modify: `app/roll/[id]/RollDetailClient.tsx:1-50`

- [ ] **Step 1: Create RollEditSheet component skeleton**

Create `components/RollEditSheet.tsx`:

```typescript
"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { CaretRight, Clock } from "@phosphor-icons/react";
import type { Roll } from "@/lib/db";
import { rollStatus } from "@/lib/status";

interface RollEditSheetProps {
  roll: Roll & {
    camera_nickname: string | null;
    camera_brand: string | null;
    camera_model: string | null;
    film_nickname: string | null;
    film_brand: string | null;
    film_name: string | null;
  };
  onClose: () => void;
  onSave: (updates: Partial<Roll>) => Promise<void>;
}

export function RollEditSheet({ roll, onClose, onSave }: RollEditSheetProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    notes: roll.notes || "",
  });

  const status = rollStatus(roll);
  const isLoaded = status === "LOADED" || status === "FRIDGE";
  const hasLab = status !== "LOADED" && status !== "FRIDGE";
  const hasScanned = status === "SCANNED" || status === "PROCESSED" || status === "ARCHIVED";
  const hasProcessed = status === "PROCESSED" || status === "ARCHIVED";
  const hasArchived = status === "ARCHIVED";

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  const cameraLabel = roll.camera_nickname ||
    (roll.camera_brand && roll.camera_model ? `${roll.camera_brand} ${roll.camera_model}` : "Not set");

  const filmLabel = roll.film_nickname ||
    (roll.film_brand && roll.film_name ? `${roll.film_brand} ${roll.film_name}` : "Not set");

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 overflow-y-auto"
        style={{
          backgroundColor: "var(--darkroom-card)",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          border: `1px solid var(--darkroom-border)`,
          borderBottom: "none",
          maxHeight: "70vh",
          paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-4">
          <div
            style={{
              width: 40,
              height: 3,
              backgroundColor: "#333",
              borderRadius: 2,
            }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
          <button
            onClick={onClose}
            className="text-xs"
            style={{ color: "var(--darkroom-text-tertiary)" }}
          >
            CANCEL
          </button>
          <div className="text-[13px] font-semibold" style={{ color: "var(--darkroom-text-primary)" }}>
            EDIT ROLL {roll.number}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs font-semibold"
            style={{ color: saving ? "var(--darkroom-text-tertiary)" : "var(--darkroom-accent)" }}
          >
            {saving ? "SAVING..." : "SAVE"}
          </button>
        </div>

        {/* Fields */}
        <div className="px-6 py-4 space-y-4">
          {/* Camera */}
          <div>
            <label className="block text-[9px] uppercase tracking-wider mb-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
              Camera
            </label>
            <button className="w-full flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
              <span className="text-xs" style={{ color: "var(--darkroom-text-primary)" }}>{cameraLabel}</span>
              <CaretRight size={12} style={{ color: "var(--darkroom-text-tertiary)" }} />
            </button>
          </div>

          {/* Film */}
          <div>
            <label className="block text-[9px] uppercase tracking-wider mb-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
              Film
            </label>
            <button className="w-full flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
              <span className="text-xs" style={{ color: "var(--darkroom-text-primary)" }}>{filmLabel}</span>
              <CaretRight size={12} style={{ color: "var(--darkroom-text-tertiary)" }} />
            </button>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[9px] uppercase tracking-wider mb-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
              Status
            </label>
            <button className="w-full flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
              <span className="text-xs" style={{ color: "var(--darkroom-text-primary)" }}>{status}</span>
              <CaretRight size={12} style={{ color: "var(--darkroom-text-tertiary)" }} />
            </button>
          </div>

          {/* Loaded Date */}
          {isLoaded && (
            <div>
              <label className="block text-[9px] uppercase tracking-wider mb-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
                Loaded Date
              </label>
              <button className="w-full flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
                <span className="text-xs" style={{ color: "var(--darkroom-text-primary)" }}>{formatDate(roll.loaded_at)}</span>
                <Clock size={12} style={{ color: "var(--darkroom-text-tertiary)" }} />
              </button>
            </div>
          )}

          {/* Lab Date */}
          {hasLab && (
            <div>
              <label className="block text-[9px] uppercase tracking-wider mb-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
                Lab Date
              </label>
              <button className="w-full flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
                <span className="text-xs" style={{ color: roll.lab_at ? "var(--darkroom-text-primary)" : "var(--darkroom-text-tertiary)" }}>
                  {formatDate(roll.lab_at)}
                </span>
                <Clock size={12} style={{ color: "var(--darkroom-text-tertiary)" }} />
              </button>
            </div>
          )}

          {/* Scanned Date */}
          {hasScanned && (
            <div>
              <label className="block text-[9px] uppercase tracking-wider mb-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
                Scanned Date
              </label>
              <button className="w-full flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
                <span className="text-xs" style={{ color: roll.scanned_at ? "var(--darkroom-text-primary)" : "var(--darkroom-text-tertiary)" }}>
                  {formatDate(roll.scanned_at)}
                </span>
                <Clock size={12} style={{ color: "var(--darkroom-text-tertiary)" }} />
              </button>
            </div>
          )}

          {/* Processed Date */}
          {hasProcessed && (
            <div>
              <label className="block text-[9px] uppercase tracking-wider mb-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
                Processed Date
              </label>
              <button className="w-full flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
                <span className="text-xs" style={{ color: roll.processed_at ? "var(--darkroom-text-primary)" : "var(--darkroom-text-tertiary)" }}>
                  {formatDate(roll.processed_at)}
                </span>
                <Clock size={12} style={{ color: "var(--darkroom-text-tertiary)" }} />
              </button>
            </div>
          )}

          {/* Archived Date */}
          {hasArchived && (
            <div>
              <label className="block text-[9px] uppercase tracking-wider mb-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
                Archived Date
              </label>
              <button className="w-full flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
                <span className="text-xs" style={{ color: roll.archived_at ? "var(--darkroom-text-primary)" : "var(--darkroom-text-tertiary)" }}>
                  {formatDate(roll.archived_at)}
                </span>
                <Clock size={12} style={{ color: "var(--darkroom-text-tertiary)" }} />
              </button>
            </div>
          )}

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[9px] uppercase tracking-wider" style={{ color: "var(--darkroom-text-tertiary)" }}>
                Notes
              </label>
              <button className="text-[9px] font-semibold" style={{ color: "var(--darkroom-accent)" }}>
                EXPAND
              </button>
            </div>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add notes..."
              className="w-full text-xs px-0 py-2 bg-transparent border-b resize-none outline-none"
              style={{
                color: "var(--darkroom-text-primary)",
                borderColor: "var(--darkroom-border)",
                fontFamily: "inherit",
              }}
              rows={2}
            />
          </div>

          {/* Quick Actions for Loaded/Fridge status */}
          {isLoaded && (
            <div className="pt-4 border-t" style={{ borderColor: "var(--darkroom-border)" }}>
              <div className="text-[9px] uppercase tracking-wider mb-3" style={{ color: "var(--darkroom-text-tertiary)" }}>
                Quick Actions
              </div>
              <div className="flex gap-2">
                <button
                  className="flex-1 py-3 text-[10px] font-semibold border rounded-md"
                  style={{
                    color: "var(--darkroom-accent)",
                    borderColor: "var(--darkroom-accent)",
                    backgroundColor: "transparent",
                  }}
                >
                  MARK AS LAB
                </button>
                <button
                  className="flex-1 py-3 text-[10px] font-semibold border rounded-md"
                  style={{
                    color: "var(--darkroom-text-tertiary)",
                    borderColor: "var(--darkroom-text-tertiary)",
                    backgroundColor: "transparent",
                  }}
                >
                  ARCHIVE
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
```

- [ ] **Step 2: Integrate edit sheet into RollDetailClient**

Update `app/roll/[id]/RollDetailClient.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RollDetailView } from "./RollDetailView";
import { RollEditSheet } from "@/components/RollEditSheet";
import type { Roll } from "@/lib/db";

interface RollDetailClientProps {
  roll: Roll & {
    camera_nickname: string | null;
    camera_brand: string | null;
    camera_model: string | null;
    film_nickname: string | null;
    film_brand: string | null;
    film_name: string | null;
    film_iso: number | null;
    film_show_iso: boolean | null;
  };
  contactSheetUrl: string | null;
}

export default function RollDetailClient({ roll, contactSheetUrl }: RollDetailClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const handleSave = async (updates: Partial<Roll>) => {
    const res = await fetch(`/api/rolls/${roll.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      throw new Error("Failed to update roll");
    }

    router.refresh();
  };

  return (
    <>
      <RollDetailView
        roll={roll}
        contactSheetUrl={contactSheetUrl}
        onEdit={() => setIsEditing(true)}
      />

      {isEditing && (
        <RollEditSheet
          roll={roll}
          onClose={() => setIsEditing(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
```

- [ ] **Step 3: Test edit sheet**

Run: `npm run dev`
Navigate to a roll detail page → click edit icon
Expected:
- Bottom sheet slides up with rounded top (20px)
- View dims behind (backdrop)
- Handle, Cancel/Save header
- Context-aware fields based on roll status
- Loaded rolls show Quick Actions buttons
- Notes field has EXPAND button (non-functional for now)

- [ ] **Step 4: Commit**

```bash
git add components/RollEditSheet.tsx app/roll/[id]/RollDetailClient.tsx
git commit -m "feat: add roll edit sheet with context-aware fields"
```

---

## Chunk 4: Phase 4 - Full-Frame Notes Editor

### Task 6: Create Full-Frame Notes Editor Component

**Files:**
- Create: `components/NotesEditor.tsx`
- Modify: `components/RollEditSheet.tsx:100-130`

- [ ] **Step 1: Create NotesEditor component**

Create `components/NotesEditor.tsx`:

```typescript
"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft } from "@phosphor-icons/react";

interface NotesEditorProps {
  rollNumber: string;
  initialValue: string;
  onSave: (notes: string) => void;
  onClose: () => void;
}

export function NotesEditor({ rollNumber, initialValue, onSave, onClose }: NotesEditorProps) {
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus textarea on mount
    textareaRef.current?.focus();
  }, []);

  const handleDone = () => {
    onSave(value);
    onClose();
  };

  const charCount = value.length;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: "var(--darkroom-bg)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-xs font-medium"
          style={{ color: "var(--darkroom-accent)" }}
        >
          <ArrowLeft size={14} weight="bold" />
          BACK
        </button>
        <div className="flex-1 text-center">
          <div className="text-[13px] font-semibold" style={{ color: "var(--darkroom-text-primary)" }}>
            NOTES
          </div>
          <div className="text-[9px] mt-0.5" style={{ color: "var(--darkroom-text-tertiary)" }}>
            ROLL {rollNumber}
          </div>
        </div>
        <button
          onClick={handleDone}
          className="text-xs font-semibold"
          style={{ color: "var(--darkroom-accent)" }}
        >
          DONE
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 px-4 py-6 overflow-hidden">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add notes about this roll..."
          className="w-full h-full bg-transparent border-none outline-none resize-none"
          style={{
            color: "var(--darkroom-text-primary)",
            fontFamily: "inherit",
            fontSize: 12,
            lineHeight: 1.6,
          }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "var(--darkroom-border)" }}>
        <div className="text-[9px]" style={{ color: "var(--darkroom-text-tertiary)" }}>
          MARKDOWN SUPPORTED
        </div>
        <div className="text-[9px]" style={{ color: "var(--darkroom-text-tertiary)" }}>
          {charCount} CHARACTERS
        </div>
      </div>
    </div>,
    document.body
  );
}
```

- [ ] **Step 2: Integrate notes editor into RollEditSheet**

Update the EXPAND button and notes field in `components/RollEditSheet.tsx`:

```typescript
// Add state at top of component
const [showNotesEditor, setShowNotesEditor] = useState(false);

// Update the Notes section:
{/* Notes */}
<div>
  <div className="flex items-center justify-between mb-1">
    <label className="text-[9px] uppercase tracking-wider" style={{ color: "var(--darkroom-text-tertiary)" }}>
      Notes
    </label>
    <button
      onClick={() => setShowNotesEditor(true)}
      className="text-[9px] font-semibold flex items-center gap-1"
      style={{ color: "var(--darkroom-accent)" }}
    >
      EXPAND
      <svg width="10" height="10" viewBox="0 0 256 256" fill="currentColor">
        <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L144,140.69a8,8,0,0,1-11.32-11.32L185.31,76.69V48a8,8,0,0,1,16,0ZM112,115.31,59.31,168H88a8,8,0,0,1,0,16H40a8,8,0,0,1-8-8V128a8,8,0,0,1,16,0v28.69l52.69-52.69a8,8,0,0,1,11.32,11.31Z"/>
      </svg>
    </button>
  </div>
  <div
    className="text-xs py-2 border-b italic truncate"
    style={{
      color: formData.notes ? "var(--darkroom-text-secondary)" : "var(--darkroom-text-tertiary)",
      borderColor: "var(--darkroom-border)",
      maxHeight: "3rem",
      overflow: "hidden",
    }}
  >
    {formData.notes || "Add notes..."}
  </div>
</div>

// Add at end of component before final closing tags:
{showNotesEditor && (
  <NotesEditor
    rollNumber={roll.number}
    initialValue={formData.notes}
    onSave={(notes) => {
      setFormData({ ...formData, notes });
      setShowNotesEditor(false);
    }}
    onClose={() => setShowNotesEditor(false)}
  />
)}
```

- [ ] **Step 3: Add NotesEditor import to RollEditSheet**

At top of `components/RollEditSheet.tsx`:

```typescript
import { NotesEditor } from "./NotesEditor";
```

- [ ] **Step 4: Test notes editor**

Run: `npm run dev`
Navigate to roll detail → edit → click EXPAND on notes
Expected:
- Full-screen editor opens
- Back/DONE buttons work
- Character count updates
- DONE saves and returns to edit sheet
- Textarea is focused on open

- [ ] **Step 5: Commit**

```bash
git add components/NotesEditor.tsx components/RollEditSheet.tsx
git commit -m "feat: add full-frame notes editor with markdown support"
```

---

## Chunk 5: Phase 5 - Remaining Pages

### Task 7: Update Settings Page Styling

**Files:**
- Modify: `app/settings/page.tsx:1-100`

- [ ] **Step 1: Update settings page header and groups**

Find the settings page component and update styling:

```typescript
// Update header
<div className="px-4 py-4 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
  <h1 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--darkroom-text-primary)" }}>
    SETTINGS
  </h1>
</div>

// Update group structure (example for Library group)
<div className="px-4 py-6">
  <div className="mb-6">
    <div className="text-[9px] uppercase tracking-wider mb-2" style={{ color: "var(--darkroom-text-tertiary)" }}>
      Library
    </div>
    <div className="border-l pl-3" style={{ borderColor: "var(--darkroom-border)" }}>
      <Link
        href="/cameras"
        className="flex items-center justify-between py-3 border-b active:bg-zinc-900/30"
        style={{ borderColor: "var(--darkroom-border-subtle)" }}
      >
        <span className="text-xs" style={{ color: "var(--darkroom-text-primary)" }}>
          Cameras
        </span>
        <CaretRight size={12} style={{ color: "var(--darkroom-text-tertiary)" }} />
      </Link>
      <Link
        href="/films"
        className="flex items-center justify-between py-3 border-b active:bg-zinc-900/30"
        style={{ borderColor: "var(--darkroom-border-subtle)" }}
      >
        <span className="text-xs" style={{ color: "var(--darkroom-text-primary)" }}>
          Films
        </span>
        <CaretRight size={12} style={{ color: "var(--darkroom-text-tertiary)" }} />
      </Link>
    </div>
  </div>

  {/* Repeat for other groups: Data, Account, etc. */}
</div>
```

- [ ] **Step 2: Test settings page**

Run: `npm run dev`
Navigate to: `/settings`
Expected:
- Dark background
- Uppercase group labels
- Vertical left border with padding
- Minimal dividers between items

- [ ] **Step 3: Commit**

```bash
git add app/settings/page.tsx
git commit -m "feat: update settings page with darkroom styling"
```

---

### Task 8: Update Stats Page Styling

**Files:**
- Modify: `app/stats/StatsClient.tsx:1-200`

- [ ] **Step 1: Update stats page header and cards**

```typescript
// Header
<div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
  <h1 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--darkroom-text-primary)" }}>
    STATS
  </h1>
  <div className="text-[10px]" style={{ color: "var(--darkroom-text-tertiary)" }}>
    2024
  </div>
</div>

// Stat cards (2x2 grid)
<div className="grid grid-cols-2 gap-4 px-4 py-6">
  <div className="border-l-2 pl-3" style={{ borderColor: "var(--darkroom-accent)" }}>
    <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
      Total Rolls
    </div>
    <div className="text-xl font-bold" style={{ color: "var(--darkroom-text-primary)" }}>
      24
    </div>
  </div>
  <div className="border-l-2 pl-3" style={{ borderColor: "#444" }}>
    <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
      Archived
    </div>
    <div className="text-xl font-bold" style={{ color: "var(--darkroom-text-primary)" }}>
      18
    </div>
  </div>
  {/* More stat cards... */}
</div>
```

- [ ] **Step 2: Update chart styling**

```typescript
// Bar chart section
<div className="px-4 py-6">
  <div className="text-[9px] uppercase tracking-wider mb-3" style={{ color: "var(--darkroom-text-tertiary)" }}>
    Monthly Activity
  </div>
  <div className="flex items-end gap-1 h-20">
    {monthlyData.map((value, idx) => {
      const isActive = idx === currentMonth;
      return (
        <div
          key={idx}
          className="flex-1"
          style={{
            height: `${value}%`,
            backgroundColor: "#1a1a1a",
            borderTop: `2px solid ${isActive ? "var(--darkroom-accent)" : "#333"}`,
          }}
        />
      );
    })}
  </div>
  <div className="flex gap-1 mt-1">
    {["J", "F", "M", "A", "M", "J"].map((month, idx) => (
      <div
        key={idx}
        className="flex-1 text-center text-[8px]"
        style={{ color: idx === currentMonth ? "var(--darkroom-accent)" : "#444" }}
      >
        {month}
      </div>
    ))}
  </div>
</div>
```

- [ ] **Step 3: Test stats page**

Run: `npm run dev`
Navigate to: `/stats`
Expected:
- 2x2 stat card grid with left border accents
- Minimal bar chart with subtle borders
- Current month highlighted in amber

- [ ] **Step 4: Commit**

```bash
git add app/stats/StatsClient.tsx
git commit -m "feat: update stats page with darkroom styling"
```

---

### Task 9: Update Cameras and Films List Pages

**Files:**
- Modify: `app/cameras/CamerasClient.tsx:1-100`
- Modify: `app/films/FilmsClient.tsx:1-100`

- [ ] **Step 1: Update cameras list styling**

```typescript
// Header
<div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
  <div className="flex items-center gap-3">
    <BackButton />
    <h1 className="text-sm font-semibold" style={{ color: "var(--darkroom-text-primary)" }}>
      CAMERAS
    </h1>
  </div>
  <div className="text-xs" style={{ color: "var(--darkroom-text-tertiary)" }}>
    {cameras.length}
  </div>
</div>

// List
<div className="px-4 py-4">
  <div className="border-l pl-3" style={{ borderColor: "var(--darkroom-border)" }}>
    {cameras.map((camera) => (
      <Link
        key={camera.id}
        href={`/cameras/${camera.id}`}
        className="block py-3 border-b active:bg-zinc-900/30"
        style={{ borderColor: "var(--darkroom-border-subtle)" }}
      >
        <div className="font-semibold text-xs" style={{ color: "var(--darkroom-text-primary)" }}>
          {camera.nickname || `${camera.brand} ${camera.model}`}
        </div>
        <div className="text-[9px] uppercase mt-0.5" style={{ color: "var(--darkroom-text-tertiary)" }}>
          {camera.format} • {camera.roll_count} ROLLS
        </div>
      </Link>
    ))}
  </div>
</div>
```

- [ ] **Step 2: Apply same pattern to films list**

Update `app/films/FilmsClient.tsx` with identical structure but film-specific data.

- [ ] **Step 3: Test cameras and films pages**

Run: `npm run dev`
Navigate to: `/cameras` and `/films`
Expected:
- Header with back button, title, count
- List with vertical left border
- Item details in smaller gray text
- Minimal subtle dividers

- [ ] **Step 4: Commit**

```bash
git add app/cameras/CamerasClient.tsx app/films/FilmsClient.tsx
git commit -m "feat: update cameras and films lists with darkroom styling"
```

---

## Verification

### Task 10: Visual and Functional Testing

- [ ] **Step 1: Visual verification checklist**

Navigate through all pages and verify:
1. All pages have #0f0f0f background
2. Bottom nav is icon-only with proper alignment
3. Amber accent only on active nav items (no pills/glow)
4. Edit sheet slides up smoothly, dims background
5. Bottom sheets have 20px rounded tops
6. Contact sheets have 8px border-radius
7. All other elements have sharp edges
8. Phosphor icons render correctly everywhere

- [ ] **Step 2: Functional testing checklist**

Test all interactions:
1. Roll list: tap roll opens detail view
2. Roll detail: tap edit opens bottom sheet
3. Edit sheet: Cancel/Save buttons work
4. Edit sheet: fields adapt to roll status
5. Notes: EXPAND opens full-frame editor
6. Notes editor: DONE saves and closes
7. Quick actions: Mark as Lab button works
8. Bottom nav: all tabs navigate correctly

- [ ] **Step 3: Edge cases testing**

Test edge cases:
1. Loaded roll shows camera icon placeholder (no contact sheet)
2. Unset dates show "Not set" in gray
3. Long notes truncate with ellipsis in metadata strip
4. Empty notes show placeholder text

- [ ] **Step 4: Document any issues**

Create GitHub issues for any bugs found during testing.

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "test: verify darkroom redesign implementation"
```

---

## Notes

**Testing Strategy:**
- Visual testing after each phase
- Functional testing after interactive components
- Edge case testing at end

**Rollback Plan:**
If issues arise, each phase is independently committable and can be reverted:
```bash
git revert <commit-hash>
```

**Performance Considerations:**
- No performance impact expected (visual-only changes)
- CSS variables may provide slight performance benefit over inline styles

**Accessibility:**
- Maintain existing aria-labels
- Color contrast verified (white on #0f0f0f meets WCAG AA)
- Touch targets remain 44px minimum

**Browser Compatibility:**
- CSS variables supported in all modern browsers
- Backdrop-filter (blur) supported in Safari 14+, Chrome 76+
- Fallback: remove blur if needed

**Future Enhancements:**
- Preview tab in notes editor (Edit/Preview tabs)
- Markdown toolbar for formatting shortcuts
- Full-screen contact sheet zoom/pan
- More quick actions for status transitions
