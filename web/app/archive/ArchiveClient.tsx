"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCachedData } from "@/hooks/useCachedData";
import { rollStatus } from "@/lib/status";
import { invalidateCache } from "@/lib/cache";
import type { Roll } from "@/lib/db";
import PullToRefresh from "@/components/PullToRefresh";
import { haptics } from "@/lib/haptics";

const STATUS_DOT: Record<string, string> = {
  SCANNED:   "bg-green-400",
  PROCESSED: "bg-purple-400",
  UPLOADED:  "bg-blue-400",
  ARCHIVED:  "bg-zinc-400",
};

const BULK_STATUSES = [
  { label: "Processed", field: "processed_at", color: "bg-purple-500" },
  { label: "Uploaded",  field: "uploaded_at",  color: "bg-blue-500" },
  { label: "Archived",  field: "archived_at",  color: "bg-zinc-500" },
] as const;

type RollRow = Roll & {
  camera_nickname: string | null;
  camera_brand: string | null;
  camera_model: string | null;
  film_nickname: string | null;
  film_brand: string | null;
  film_name: string | null;
  film_iso: number | null;
  film_show_iso: boolean | null;
};

interface ArchiveData { rolls: RollRow[]; }

function rollYear(roll: RollRow): number {
  const match = roll.roll_number.match(/^(\d{2})x/);
  if (match) return 2000 + parseInt(match[1], 10);
  if (roll.scanned_at) return new Date(roll.scanned_at).getFullYear();
  return new Date().getFullYear();
}

function cameraLabel(roll: RollRow): string {
  if (roll.camera_nickname) return roll.camera_nickname;
  if (roll.camera_brand && roll.camera_model) return `${roll.camera_brand} ${roll.camera_model}`;
  return roll.camera_id ?? "";
}

function filmLabel(roll: RollRow): string {
  if (roll.film_nickname) return roll.film_nickname;
  if (roll.film_brand && roll.film_name) {
    const iso = roll.film_show_iso && roll.film_iso ? ` ${roll.film_iso}` : "";
    return `${roll.film_brand} ${roll.film_name}${iso}`;
  }
  return roll.film_id ?? "";
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-amber-400 border-amber-400" : "border-zinc-300 dark:border-zinc-600"}`}>
      {checked && (
        <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  );
}

function PlaceholderSheet({ rollNumber }: { rollNumber: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-zinc-800 dark:bg-zinc-900 select-none relative">
      <div className="absolute top-0 inset-x-0 flex justify-around px-2 py-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-2 h-1.5 rounded-sm bg-zinc-700 dark:bg-zinc-800" />
        ))}
      </div>
      <span className="text-zinc-500 text-[13px] font-mono tracking-widest uppercase">
        {rollNumber}
      </span>
      <div className="absolute bottom-0 inset-x-0 flex justify-around px-2 py-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-2 h-1.5 rounded-sm bg-zinc-700 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}

// ── Grid card (1-column, 3:2 landscape) ───────────────────────────────────────
function GridCard({ roll, editing, selected, onToggle }: {
  roll: RollRow; editing: boolean; selected: boolean; onToggle: () => void;
}) {
  const status = rollStatus(roll);
  const film = filmLabel(roll);
  const dateStr = roll.scanned_at
    ? new Date(roll.scanned_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : null;

  const inner = (
    <>
      {roll.contact_sheet_url
        ? <img src={roll.contact_sheet_url} alt={roll.roll_number} className="w-full h-full object-cover" />
        : <PlaceholderSheet rollNumber={roll.roll_number} />
      }
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent pt-6 pb-2 px-3">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="text-white text-[13px] font-semibold font-mono leading-tight truncate">{roll.roll_number}</div>
            {film && <div className="text-white/60 text-[11px] truncate leading-tight mt-0.5">{film}</div>}
          </div>
          {dateStr && <div className="text-white/50 text-[11px] shrink-0">{dateStr}</div>}
        </div>
      </div>
      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${STATUS_DOT[status] ?? "bg-zinc-400"} shadow-sm`} />
      {editing && (
        <div className="absolute top-2 left-2">
          <Checkbox checked={selected} />
        </div>
      )}
    </>
  );

  if (editing) {
    return (
      <button
        onClick={() => { onToggle(); haptics.light(); }}
        className={`relative w-full aspect-[3/2] rounded-xl overflow-hidden bg-zinc-800 transition-transform active:scale-[0.98] ${selected ? "ring-2 ring-amber-400 ring-offset-1 ring-offset-gray-50 dark:ring-offset-zinc-950" : ""}`}
      >
        {inner}
      </button>
    );
  }
  return (
    <Link
      href={`/roll/${roll.roll_number}`}
      onClick={() => haptics.light()}
      className="block relative w-full aspect-[3/2] rounded-xl overflow-hidden bg-zinc-800 active:scale-[0.98] transition-transform"
    >
      {inner}
    </Link>
  );
}

// ── List row ──────────────────────────────────────────────────────────────────
function ListRow({ roll, editing, selected, onToggle }: {
  roll: RollRow; editing: boolean; selected: boolean; onToggle: () => void;
}) {
  const status = rollStatus(roll);
  const camera = cameraLabel(roll);
  const film = filmLabel(roll);
  const subtitle = [camera, film].filter(Boolean).join(" · ");
  const dateStr = roll.scanned_at
    ? new Date(roll.scanned_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null;

  const content = (
    <>
      {editing && <Checkbox checked={selected} />}
      {!editing && (
        <div className={`w-2 h-2 rounded-full shrink-0 mt-[5px] ${STATUS_DOT[status] ?? "bg-zinc-300"}`} />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-semibold text-[15px] truncate">{roll.roll_number}</span>
          {dateStr && <span className="text-[13px] text-zinc-400 dark:text-zinc-500 shrink-0">{dateStr}</span>}
        </div>
        {subtitle && (
          <div className="text-[14px] text-zinc-600 dark:text-zinc-300 truncate mt-0.5">{subtitle}</div>
        )}
        <div className="text-[13px] text-zinc-400 dark:text-zinc-500 mt-0.5">{status}</div>
      </div>
      {!editing && (
        <svg className="w-4 h-4 text-zinc-300 dark:text-zinc-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
    </>
  );

  const cls = `flex items-start gap-3 py-3 -mx-4 px-4 transition-colors border-b border-zinc-200 dark:border-zinc-800 last:border-b-0`;

  if (editing) {
    return (
      <li>
        <button onClick={() => { onToggle(); haptics.light(); }} className={`${cls} w-full text-left active:bg-zinc-100 dark:active:bg-zinc-800/50`}>
          {content}
        </button>
      </li>
    );
  }
  return (
    <li>
      <Link href={`/roll/${roll.roll_number}`} onClick={() => haptics.light()} className={`${cls} block active:bg-zinc-100 dark:active:bg-zinc-800/50`}>
        {content}
      </Link>
    </li>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" />
    </svg>
  );
}
function ListIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ArchiveClient() {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
  const headers: HeadersInit = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};

  const { data, isLoading } = useCachedData<ArchiveData>(
    ["rolls", "archive"],
    async () => {
      const res = await fetch("/api/rolls/archive", { headers });
      if (!res.ok) throw new Error("Failed to fetch archive");
      return res.json();
    },
    { apiKey }
  );

  const router = useRouter();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState(false);

  function toggleSelect(n: string) {
    setSelected((prev) => { const s = new Set(prev); s.has(n) ? s.delete(n) : s.add(n); return s; });
  }
  function enterEdit() { setEditing(true); setSelected(new Set()); haptics.medium(); }
  function exitEdit()  { setEditing(false); setSelected(new Set()); }

  async function applyStatus(field: string) {
    if (selected.size === 0 || applying) return;
    setApplying(true);
    haptics.medium();
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

  if (isLoading && !data) {
    return (
      <div>
        <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-6" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-full aspect-[3/2] rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.rolls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="text-4xl">🎞️</div>
        <p className="text-zinc-400 text-center">No scanned rolls yet.<br />Scanned rolls appear here.</p>
      </div>
    );
  }

  const byYear = new Map<number, RollRow[]>();
  for (const roll of data.rolls) {
    const y = rollYear(roll);
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(roll);
  }
  const years = Array.from(byYear.keys()).sort((a, b) => b - a);

  return (
    <>
      <PullToRefresh onRefresh={async () => { router.refresh(); }}>
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Archive</h1>
            <div className="flex items-center gap-2">
              {/* View toggle */}
              {!editing && (
                <div className="flex gap-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                  <button
                    onClick={() => { setView("list"); haptics.light(); }}
                    className={`p-1.5 rounded-md transition-colors ${view === "list" ? "bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-400 dark:text-zinc-500"}`}
                  >
                    <ListIcon active={view === "list"} />
                  </button>
                  <button
                    onClick={() => { setView("grid"); haptics.light(); }}
                    className={`p-1.5 rounded-md transition-colors ${view === "grid" ? "bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-400 dark:text-zinc-500"}`}
                  >
                    <GridIcon active={view === "grid"} />
                  </button>
                </div>
              )}
              {/* Edit / Done (top — only shown when NOT editing) */}
              {!editing && (
                <button
                  onClick={enterEdit}
                  className="text-sm font-medium text-zinc-500 dark:text-zinc-400 px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {years.map((year) => {
              const yearRolls = byYear.get(year)!;
              return (
                <section key={year}>
                  <div className="flex items-baseline gap-2 mb-3">
                    <h2 className="text-lg font-bold">{year}</h2>
                    <span className="text-sm text-zinc-500">{yearRolls.length} roll{yearRolls.length !== 1 ? "s" : ""}</span>
                  </div>
                  {view === "grid" ? (
                    <div className="space-y-2">
                      {yearRolls.map((roll) => (
                        <GridCard key={roll.roll_number} roll={roll} editing={editing} selected={selected.has(roll.roll_number)} onToggle={() => toggleSelect(roll.roll_number)} />
                      ))}
                    </div>
                  ) : (
                    <ul>
                      {yearRolls.map((roll) => (
                        <ListRow key={roll.roll_number} roll={roll} editing={editing} selected={selected.has(roll.roll_number)} onToggle={() => toggleSelect(roll.roll_number)} />
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </PullToRefresh>

      {/* Edit-mode action bar — replaces bottom nav visually, always visible */}
      {editing && (
        <div
          className="fixed inset-x-0 bottom-0 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-200/70 dark:border-zinc-700/60"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-center gap-2 px-4 py-3">
            <button
              onClick={exitEdit}
              className="text-sm font-semibold text-amber-600 dark:text-amber-400 mr-auto px-1"
            >
              Done
            </button>
            {selected.size === 0 ? (
              <span className="text-[13px] text-zinc-400">Select rolls to update</span>
            ) : (
              <>
                <span className="text-[13px] text-zinc-500">{selected.size} selected</span>
                {BULK_STATUSES.map(({ label, field, color }) => (
                  <button
                    key={field}
                    onClick={() => applyStatus(field)}
                    disabled={applying}
                    className={`${color} text-white text-[13px] font-medium px-3 py-1.5 rounded-xl active:scale-95 transition-transform disabled:opacity-50`}
                  >
                    {applying ? "…" : label}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
