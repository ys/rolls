"use client";

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useCachedData } from "@/hooks/useCachedData";
import { rollStatus } from "@/lib/status";
import { invalidateCache } from "@/lib/cache";
import type { Roll } from "@/lib/db";
import PullToRefresh from "@/components/PullToRefresh";
import { RollSkeleton } from "@/components/Skeleton";
import { haptics } from "@/lib/haptics";

const STATUS_NEXT: Partial<Record<string, { field: string; label: string; color: string }>> = {
  LOADED: { field: "fridge_at",  label: "→ Fridge", color: "bg-cyan-500"   },
  FRIDGE: { field: "lab_at",     label: "→ Lab",    color: "bg-orange-500" },
  LAB:    { field: "scanned_at", label: "Scanned",  color: "bg-green-500"  },
};

type RollRow = Roll & {
  camera_nickname: string | null;
  camera_brand:    string | null;
  camera_model:    string | null;
  film_nickname:   string | null;
  film_brand:      string | null;
  film_name:       string | null;
  film_iso:        number | null;
  film_show_iso:   boolean | null;
  film_slug:       string | null;
};

interface HomeData { rolls: RollRow[]; }

function cameraLabel(roll: RollRow): string {
  if (roll.camera_nickname) return roll.camera_nickname;
  if (roll.camera_brand && roll.camera_model) return `${roll.camera_brand} ${roll.camera_model}`;
  return "";
}

function filmLabel(roll: RollRow): string {
  if (roll.film_nickname) return roll.film_nickname;
  if (roll.film_brand && roll.film_name) {
    const iso = roll.film_show_iso && roll.film_iso ? ` ${roll.film_iso}` : "";
    return `${roll.film_brand} ${roll.film_name}${iso}`;
  }
  return "";
}

function firstNotesLine(notes: string | null): string | null {
  if (!notes) return null;
  const line = notes.split("\n").find((l) => l.trim());
  if (!line) return null;
  return line
    .replace(/^#+\s+/, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <div
      className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
      style={{
        backgroundColor: checked ? "var(--darkroom-accent)" : "transparent",
        borderColor: checked ? "var(--darkroom-accent)" : "var(--darkroom-border)",
      }}
    >
      {checked && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} style={{ color: "#000" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  );
}

function RollItem({ roll, editing, selected, onToggle, onAdvance, isRecent }: {
  roll: RollRow; editing: boolean; selected: boolean;
  onToggle: () => void; onAdvance: (field: string) => void; isRecent: boolean;
}) {
  const status = rollStatus(roll);
  const next = editing ? undefined : STATUS_NEXT[status];
  const dateStr = roll.shot_at
    ? new Date(roll.shot_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null;
  const cam = cameraLabel(roll);
  const film = filmLabel(roll);
  const notePreview = firstNotesLine(roll.notes);

  // Determine left border color
  const borderColor = isRecent ? "var(--darkroom-accent)" : "#444";

  const cardBase = "py-4 border-l-2";

  const mainContent = (
    <>
      {editing && <Checkbox checked={selected} />}
      <div className="flex-1 min-w-0 pl-3">
        <div className="font-semibold" style={{ color: "var(--darkroom-text-primary)" }}>
          {roll.roll_number}
        </div>
        <div className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: "var(--darkroom-text-secondary)" }}>
          {cam && film ? `${cam} • ${film}` : cam || film || "—"}
        </div>
        <div className="text-[10px] mt-1 uppercase" style={{ color: "var(--darkroom-text-tertiary)" }}>
          {status}
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
    <li>
      <div
        className={cardBase}
        style={{ borderColor }}
      >
        {editing ? (
          <div className="flex items-start gap-3 px-4" onClick={onToggle}>
            {mainContent}
          </div>
        ) : (
          <Link href={`/roll/${roll.roll_number}`} className="flex items-start gap-3 px-4 active:bg-zinc-900/30">
            {mainContent}
          </Link>
        )}
      </div>
    </li>
  );
}

export default function HomeClient() {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
  const headers: HeadersInit = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};

  const { data, isLoading } = useCachedData<HomeData>(
    ["rolls", "home"],
    async () => {
      const res = await fetch("/api/rolls/home", { headers });
      if (!res.ok) throw new Error("Failed to fetch rolls");
      return res.json();
    },
    { apiKey }
  );

  const router = useRouter();
  const [editing, setEditing]   = useState(false);
  const [exiting, setExiting]   = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [search, setSearch]     = useState("");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    return () => { document.body.removeAttribute("data-mass-edit"); };
  }, []);

  function toggleSelect(n: string) {
    setSelected((prev) => { const s = new Set(prev); s.has(n) ? s.delete(n) : s.add(n); return s; });
  }
  function enterEdit() {
    setEditing(true); setExiting(false); setSelected(new Set());
    document.body.setAttribute("data-mass-edit", "");
    haptics.medium();
  }
  function exitEdit() {
    setExiting(true); haptics.light();
    setTimeout(() => {
      setEditing(false); setExiting(false); setSelected(new Set());
      document.body.removeAttribute("data-mass-edit");
    }, 220);
  }

  async function applyStatus(field: string) {
    if (selected.size === 0 || applying) return;
    setApplying(true); haptics.medium();
    await fetch("/api/rolls/bulk-update", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ roll_numbers: [...selected], field, value: new Date().toISOString() }),
    });
    invalidateCache("rolls");
    haptics.success();
    setApplying(false);
    exitEdit();
    router.refresh();
  }

  async function advanceSingle(rollNumber: string, field: string) {
    await fetch("/api/rolls/bulk-update", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ roll_numbers: [rollNumber], field, value: new Date().toISOString() }),
    });
    invalidateCache("rolls");
    haptics.success();
    router.refresh();
  }

  if (!mounted || (isLoading && !data)) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-24 animate-pulse" style={{ backgroundColor: "var(--darkroom-border)" }} />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="py-4 border-l-2 pl-3" style={{ borderColor: "#444" }}>
            <div className="h-4 w-16 mb-2 animate-pulse" style={{ backgroundColor: "var(--darkroom-border)" }} />
            <div className="h-3 w-32 mb-1 animate-pulse" style={{ backgroundColor: "var(--darkroom-border-subtle)" }} />
            <div className="h-3 w-24 animate-pulse" style={{ backgroundColor: "var(--darkroom-border-subtle)" }} />
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return <div className="flex items-center justify-center py-16"><div className="text-zinc-400">No data available</div></div>;
  }

  const { rolls } = data;

  // Search filtering
  const searchQuery = search.trim().toLowerCase();
  const filteredRolls = searchQuery
    ? rolls.filter((r) =>
        r.roll_number.toLowerCase().includes(searchQuery) ||
        cameraLabel(r).toLowerCase().includes(searchQuery) ||
        filmLabel(r).toLowerCase().includes(searchQuery) ||
        (r.notes?.toLowerCase().includes(searchQuery) ?? false) ||
        (r.tags?.some((t) => t.toLowerCase().includes(searchQuery)) ?? false)
      )
    : rolls;

  const loaded   = filteredRolls.filter((r) => rollStatus(r) === "LOADED");
  const inFridge = filteredRolls.filter((r) => rollStatus(r) === "FRIDGE");
  const atLab    = filteredRolls.filter((r) => rollStatus(r) === "LAB");

  // Derive available bulk actions from the statuses of selected rolls
  const rollMap = new Map(rolls.map((r) => [r.roll_number, r]));
  const seenFields = new Set<string>();
  const availableActions: Array<{ field: string; label: string; color: string }> = [];
  for (const num of selected) {
    const roll = rollMap.get(num);
    if (!roll) continue;
    const next = STATUS_NEXT[rollStatus(roll)];
    if (next && !seenFields.has(next.field)) {
      seenFields.add(next.field);
      availableActions.push(next);
    }
  }

  return (
    <>
      <PullToRefresh onRefresh={async () => { router.refresh(); }}>
        <div>
          <div className="flex items-center justify-between px-4 py-4 border-b mb-6" style={{ borderColor: "var(--darkroom-border)" }}>
            <h1 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--darkroom-text-primary)" }}>
              ROLLS
            </h1>
            <div className="flex items-center gap-3">
              <div className="text-xs uppercase" style={{ color: "var(--darkroom-text-tertiary)" }}>
                {rolls.length} ACTIVE
              </div>
              {rolls.length > 0 && !editing && (
                <button
                  onClick={enterEdit}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                  style={{
                    color: "var(--darkroom-text-secondary)",
                    backgroundColor: "transparent",
                    border: `1px solid var(--darkroom-border)`,
                  }}
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          {rolls.length > 0 && !editing && (
            <div className="relative mb-6 px-4">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search rolls…"
                className="w-full px-3 py-2 text-xs border-b bg-transparent focus:outline-none"
                style={{
                  color: "var(--darkroom-text-primary)",
                  borderColor: search ? "var(--darkroom-accent)" : "var(--darkroom-border)",
                  fontFamily: "inherit",
                }}
              />
            </div>
          )}

          {rolls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--darkroom-text-disabled)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
              </svg>
              <p className="text-center text-xs" style={{ color: "var(--darkroom-text-tertiary)" }}>
                No active rolls.<br />Tap <strong style={{ color: "var(--darkroom-text-secondary)" }}>+</strong> to load a new roll.
              </p>
            </div>
          ) : searchQuery && filteredRolls.length === 0 ? (
            <p className="text-center py-16 text-xs" style={{ color: "var(--darkroom-text-tertiary)" }}>
              No rolls match &ldquo;{search}&rdquo;
            </p>
          ) : (
            <div className="space-y-8">
              {searchQuery ? (
                // Flat search results
                <ul className="space-y-2">
                  {filteredRolls.map((roll) => (
                    <RollItem
                      key={roll.roll_number}
                      roll={roll}
                      editing={false}
                      selected={false}
                      onToggle={() => {}}
                      onAdvance={(field) => advanceSingle(roll.roll_number, field)}
                      isRecent={roll.roll_number === rolls[0]?.roll_number}
                    />
                  ))}
                </ul>
              ) : (
                // Grouped by status
                [
                  { label: "Loaded",        rolls: loaded   },
                  { label: "In the Fridge", rolls: inFridge },
                  { label: "At the Lab",    rolls: atLab    },
                ].map(({ label, rolls: sectionRolls }) => sectionRolls.length > 0 && (
                  <section key={label}>
                    <div className="flex items-baseline justify-between mb-3 px-4">
                      <div className="flex items-baseline gap-2">
                        <h2 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--darkroom-text-secondary)" }}>
                          {label}
                        </h2>
                        <span className="text-[10px]" style={{ color: "var(--darkroom-text-tertiary)" }}>
                          {sectionRolls.length}
                        </span>
                      </div>
                      {editing && (
                        <button
                          onClick={() => {
                            const nums = sectionRolls.map((r) => r.roll_number);
                            const allSel = nums.every((n) => selected.has(n));
                            setSelected((prev) => {
                              const s = new Set(prev);
                              if (allSel) { nums.forEach((n) => s.delete(n)); haptics.light(); }
                              else { nums.forEach((n) => s.add(n)); haptics.medium(); }
                              return s;
                            });
                          }}
                          className="text-[10px] font-medium uppercase active:opacity-50 transition-opacity"
                          style={{
                            color: sectionRolls.every((r) => selected.has(r.roll_number))
                              ? "var(--darkroom-accent)"
                              : "var(--darkroom-text-tertiary)"
                          }}
                        >
                          {sectionRolls.every((r) => selected.has(r.roll_number)) ? "Deselect" : "Select all"}
                        </button>
                      )}
                    </div>
                    <ul className="space-y-2">
                      {sectionRolls.map((roll) => (
                        <RollItem
                          key={roll.roll_number}
                          roll={roll}
                          editing={editing}
                          selected={selected.has(roll.roll_number)}
                          onToggle={() => toggleSelect(roll.roll_number)}
                          onAdvance={(field) => advanceSingle(roll.roll_number, field)}
                          isRecent={roll.roll_number === rolls[0]?.roll_number}
                        />
                      ))}
                    </ul>
                  </section>
                ))
              )}
            </div>
          )}
        </div>
      </PullToRefresh>

      {/* Edit-mode action bar — portalled to body to escape PageTransition transform */}
      {editing && mounted && createPortal(
        <div
          className="fixed bottom-0 inset-x-0 z-20 flex justify-center items-end gap-3 pointer-events-none px-4"
          style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom) + 64px)" }}
        >
          <div
            className="pointer-events-auto h-12 flex items-center gap-3 px-4 border"
            style={{
              backgroundColor: "var(--darkroom-card)",
              borderColor: "var(--darkroom-border)",
              transformOrigin: "center bottom",
              animation: exiting
                ? "editBarFlipOut 0.22s cubic-bezier(0.4,0,1,1) forwards"
                : "editBarFlipIn 0.28s cubic-bezier(0,0,0.2,1) forwards",
            }}
          >
            <button
              onClick={exitEdit}
              disabled={exiting}
              className="text-xs font-semibold px-1 active:opacity-50 transition-opacity disabled:opacity-40"
              style={{ color: "var(--darkroom-accent)" }}
            >
              DONE
            </button>
            <div className="w-px h-4" style={{ backgroundColor: "var(--darkroom-border)" }} />
            {selected.size === 0 ? (
              <span className="text-[11px] px-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
                Select rolls…
              </span>
            ) : (
              <>
                <span className="text-[11px] tabular-nums" style={{ color: "var(--darkroom-text-secondary)" }}>
                  {selected.size} selected
                </span>
                {availableActions.map(({ label, field }) => (
                  <Fragment key={field}>
                    <div className="w-px h-4" style={{ backgroundColor: "var(--darkroom-border)" }} />
                    <button
                      onClick={() => applyStatus(field)}
                      disabled={applying}
                      className="text-[11px] font-medium px-3 py-1.5 border active:scale-95 transition-transform disabled:opacity-50"
                      style={{
                        color: "var(--darkroom-accent)",
                        borderColor: "var(--darkroom-accent)",
                        backgroundColor: "transparent",
                      }}
                    >
                      {applying ? "…" : label}
                    </button>
                  </Fragment>
                ))}
              </>
            )}
          </div>
        </div>
        , document.body
      )}
    </>
  );
}
