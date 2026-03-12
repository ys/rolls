"use client";

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Camera, FilmStrip } from "@phosphor-icons/react";
import { useCachedData } from "@/hooks/useCachedData";
import { rollStatus } from "@/lib/status";
import { invalidateCache } from "@/lib/cache";
import type { Roll } from "@/lib/db";
import PullToRefresh from "@/components/PullToRefresh";
import { haptics } from "@/lib/haptics";
import { FILM_GRADIENTS } from "@/lib/film-gradients";

const STATUS_DOT: Record<string, string> = {
  SCANNED: "bg-green-400",
  PROCESSED: "bg-purple-400",
  UPLOADED: "bg-blue-400",
  ARCHIVED: "bg-zinc-400",
};

const STATUS_NEXT: Partial<
  Record<string, { field: string; label: string; color: string }>
> = {
  SCANNED: {
    field: "processed_at",
    label: "Processed",
    color: "bg-purple-500",
  },
  PROCESSED: { field: "uploaded_at", label: "Uploaded", color: "bg-blue-500" },
  UPLOADED: { field: "archived_at", label: "Archived", color: "bg-zinc-500" },
};

type RollRow = Roll & {
  camera_nickname: string | null;
  camera_brand: string | null;
  camera_model: string | null;
  film_nickname: string | null;
  film_brand: string | null;
  film_name: string | null;
  film_iso: number | null;
  film_show_iso: boolean | null;
  film_slug: string | null;
};

interface ArchiveData {
  rolls: RollRow[];
}

function rollYear(roll: RollRow): number {
  const match = roll.roll_number.match(/^(\d{2})x/);
  if (match) return 2000 + parseInt(match[1], 10);
  if (roll.scanned_at) return new Date(roll.scanned_at).getFullYear();
  return new Date().getFullYear();
}

function cameraLabel(roll: RollRow): string {
  if (roll.camera_nickname) return roll.camera_nickname;
  if (roll.camera_brand && roll.camera_model)
    return `${roll.camera_brand} ${roll.camera_model}`;
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

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <div
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-amber-400 border-amber-400" : "border-zinc-300 dark:border-zinc-600"}`}
    >
      {checked && (
        <svg
          className="w-3 h-3 text-black"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
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
          <div
            key={i}
            className="w-2 h-1.5 rounded-sm bg-zinc-700 dark:bg-zinc-800"
          />
        ))}
      </div>
      <span className="text-zinc-500 text-[13px] font-mono tracking-widest uppercase">
        {rollNumber}
      </span>
      <div className="absolute bottom-0 inset-x-0 flex justify-around px-2 py-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-1.5 rounded-sm bg-zinc-700 dark:bg-zinc-800"
          />
        ))}
      </div>
    </div>
  );
}

// ── Grid card ─────────────────────────────────────────────────────────────────
function GridCard({
  roll,
  editing,
  selected,
  onToggle,
}: {
  roll: RollRow;
  editing: boolean;
  selected: boolean;
  onToggle: () => void;
}) {
  const status = rollStatus(roll);
  const film = filmLabel(roll);
  const dateStr = roll.scanned_at
    ? new Date(roll.scanned_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // Contact sheet cards: natural image height so nothing is cropped.
  // Placeholder cards: fixed landscape ratio.
  const hasImage = !!roll.contact_sheet_url;
  const containerBase = hasImage
    ? "relative w-full rounded-xl overflow-hidden bg-zinc-900"
    : "relative w-full aspect-[3/2] rounded-xl overflow-hidden bg-zinc-800";

  const inner = (
    <>
      {hasImage ? (
        <img
          src={roll.contact_sheet_url!}
          alt={roll.roll_number}
          className="w-full h-auto block"
        />
      ) : (
        <PlaceholderSheet rollNumber={roll.roll_number} />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent pt-6 pb-2 px-3">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <div className="text-white text-[13px] font-semibold font-mono leading-tight truncate">
                {roll.roll_number}
              </div>
              {roll.push_pull != null && (
                <span className="text-[10px] font-mono font-semibold text-white/80 bg-white/15 px-1 py-px rounded leading-tight shrink-0">
                  {roll.push_pull > 0 ? `+${roll.push_pull}` : `${roll.push_pull}`}
                </span>
              )}
            </div>
            {film && (
              <div className="text-white/60 text-[11px] truncate leading-tight mt-0.5">
                {film}
              </div>
            )}
          </div>
          {dateStr && (
            <div className="text-white/50 text-[11px] shrink-0">{dateStr}</div>
          )}
        </div>
      </div>
      <div
        className={`absolute top-2 right-2 w-2 h-2 rounded-full ${STATUS_DOT[status] ?? "bg-zinc-400"} shadow-sm`}
      />
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
        onClick={() => {
          onToggle();
          haptics.light();
        }}
        className={`${containerBase} transition-transform active:scale-[0.98] ${selected ? "ring-2 ring-amber-400 ring-offset-1 ring-offset-gray-50 dark:ring-offset-zinc-950" : ""}`}
      >
        {inner}
      </button>
    );
  }
  return (
    <Link
      href={`/roll/${roll.roll_number}`}
      onClick={() => haptics.light()}
      className={`block ${containerBase} active:scale-[0.98] transition-transform`}
    >
      {inner}
    </Link>
  );
}

// ── List row ──────────────────────────────────────────────────────────────────
function ListRow({
  roll,
  editing,
  selected,
  onToggle,
}: {
  roll: RollRow;
  editing: boolean;
  selected: boolean;
  onToggle: () => void;
}) {
  const status = rollStatus(roll);
  const camera = cameraLabel(roll);
  const film = filmLabel(roll);
  const dateStr = roll.scanned_at
    ? new Date(roll.scanned_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  const gradient = roll.film_slug ? FILM_GRADIENTS[roll.film_slug] : undefined;
  const stripeStyle: React.CSSProperties = gradient
    ? { background: `linear-gradient(to bottom, ${gradient[0]}, ${gradient[1]})` }
    : { background: "#d4d4d8" };

  const content = (
    <>
      {/* Film color stripe */}
      <div className="self-stretch w-1 rounded-full shrink-0" style={stripeStyle} />
      {editing && <Checkbox checked={selected} />}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-semibold text-[15px] truncate">
            {roll.roll_number}
          </span>
          {dateStr && (
            <span className="text-[13px] text-zinc-400 dark:text-zinc-500 shrink-0">
              {dateStr}
            </span>
          )}
        </div>
        {(camera || film) && (
          <div className="flex flex-col gap-0.5 mt-0.5">
            {camera && (
              <span className="flex items-center gap-1 text-[13px] text-zinc-500 dark:text-zinc-400 truncate">
                <Camera size={12} weight="bold" className="shrink-0" />{camera}
              </span>
            )}
            {film && (
              <span className="flex items-center gap-1 text-[13px] text-zinc-500 dark:text-zinc-400 truncate">
                <FilmStrip size={12} weight="bold" className="shrink-0" />{film}
                {roll.push_pull != null && (
                  <span className="text-[12px] font-mono text-zinc-400 dark:text-zinc-500 shrink-0">
                    {roll.push_pull > 0 ? `+${roll.push_pull}` : `${roll.push_pull}`}
                  </span>
                )}
              </span>
            )}
          </div>
        )}
        <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 uppercase tracking-wide">
          {status}
        </div>
      </div>
      {!editing && (
        <div className="flex items-center gap-2 shrink-0">
          {roll.contact_sheet_url && (
            <div className="w-10 h-10 rounded-md overflow-hidden bg-zinc-800 shrink-0">
              <img
                src={roll.contact_sheet_url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <svg
            className="w-4 h-4 text-zinc-300 dark:text-zinc-600 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      )}
    </>
  );

  const clsBase = `flex items-center gap-3 p-3 border-b active:bg-zinc-900/30 transition-colors`;
  const clsStyle = { borderColor: "var(--darkroom-border)" };

  if (editing) {
    return (
      <li>
        <button
          onClick={() => {
            onToggle();
            haptics.light();
          }}
          className={`${clsBase} w-full text-left`}
          style={clsStyle}
        >
          {content}
        </button>
      </li>
    );
  }
  return (
    <li>
      <Link
        href={`/roll/${roll.roll_number}`}
        onClick={() => haptics.light()}
        className={`${clsBase} block`}
        style={clsStyle}
      >
        {content}
      </Link>
    </li>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function GridIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
    </svg>
  );
}
function ListIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ArchiveClient() {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
  const headers: HeadersInit = apiKey
    ? { Authorization: `Bearer ${apiKey}` }
    : {};

  const { data, isLoading } = useCachedData<ArchiveData>(
    ["rolls", "archive"],
    async () => {
      const res = await fetch("/api/rolls/archive", { headers });
      if (!res.ok) throw new Error("Failed to fetch archive");
      return res.json();
    },
    { apiKey },
  );

  const router = useRouter();
  const [view, setView] = useState<"grid" | "list">("list");
  const [editing, setEditing] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Clean up body attribute if component unmounts while editing
  useEffect(() => {
    return () => {
      document.body.removeAttribute("data-mass-edit");
    };
  }, []);

  function toggleSelect(n: string) {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(n) ? s.delete(n) : s.add(n);
      return s;
    });
  }
  function enterEdit() {
    setEditing(true);
    setExiting(false);
    setSelected(new Set());
    document.body.setAttribute("data-mass-edit", "");
    haptics.medium();
  }
  function exitEdit() {
    setExiting(true);
    haptics.light();
    setTimeout(() => {
      setEditing(false);
      setExiting(false);
      setSelected(new Set());
      document.body.removeAttribute("data-mass-edit");
    }, 220);
  }

  function selectAll() {
    if (!data) return;
    const all = new Set(data.rolls.map((r) => r.roll_number));
    if (selected.size === all.size) {
      setSelected(new Set());
      haptics.light();
    } else {
      setSelected(all);
      haptics.medium();
    }
  }
  const allSelected = !!data && selected.size === data.rolls.length;

  async function applyStatus(field: string) {
    if (selected.size === 0 || applying) return;
    setApplying(true);
    haptics.medium();
    await fetch("/api/rolls/bulk-update", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({
        roll_numbers: [...selected],
        field,
        value: new Date().toISOString(),
      }),
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
            <div
              key={i}
              className="w-full aspect-[3/2] rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.rolls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="text-4xl">🎞️</div>
        <p className="text-zinc-400 text-center">
          No scanned rolls yet.
          <br />
          Scanned rolls appear here.
        </p>
      </div>
    );
  }

  // Search + tag filtering
  const searchQuery = search.trim().toLowerCase();
  const filteredRolls = data.rolls.filter((r) => {
    if (selectedTag && !(r.tags ?? []).includes(selectedTag)) return false;
    if (!searchQuery) return true;
    return (
      r.roll_number.toLowerCase().includes(searchQuery) ||
      cameraLabel(r).toLowerCase().includes(searchQuery) ||
      filmLabel(r).toLowerCase().includes(searchQuery) ||
      (r.notes?.toLowerCase().includes(searchQuery) ?? false) ||
      (r.tags?.some((t) => t.toLowerCase().includes(searchQuery)) ?? false)
    );
  });

  // Collect all unique tags across all rolls
  const allTags = Array.from(
    new Set(data.rolls.flatMap((r) => r.tags ?? []))
  ).sort();

  const byYear = new Map<number, RollRow[]>();
  for (const roll of filteredRolls) {
    const y = rollYear(roll);
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(roll);
  }
  const years = Array.from(byYear.keys()).sort((a, b) => b - a);
  const displayYear = selectedYear ?? years[0];
  const yearsToShow = selectedYear ? [selectedYear] : years;

  // Derive available bulk actions from the statuses of selected rolls
  const rollMap = new Map(data.rolls.map((r) => [r.roll_number, r]));
  const seenFields = new Set<string>();
  const availableActions: Array<{
    field: string;
    label: string;
    color: string;
  }> = [];
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
      <PullToRefresh
        onRefresh={async () => {
          router.refresh();
        }}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--darkroom-text-primary)" }}>ARCHIVE</h1>
            <div className="flex items-center gap-2">
              {/* View toggle */}
              {!editing && (
                <div className="flex gap-0.5 p-1">
                  <button
                    onClick={() => {
                      setView("list");
                      haptics.light();
                    }}
                    className={`p-1.5 transition-colors ${view === "list" ? "text-amber-400" : "text-zinc-600"}`}
                  >
                    <ListIcon active={view === "list"} />
                  </button>
                  <button
                    onClick={() => {
                      setView("grid");
                      haptics.light();
                    }}
                    className={`p-1.5 transition-colors ${view === "grid" ? "text-amber-400" : "text-zinc-600"}`}
                  >
                    <GridIcon active={view === "grid"} />
                  </button>
                </div>
              )}
              {/* Edit / Done (top — only shown when NOT editing) */}
              {!editing && (
                <button
                  onClick={enterEdit}
                  className="text-xs font-medium px-3 py-1.5 transition-colors" style={{ color: "var(--darkroom-text-secondary)", backgroundColor: "transparent", border: "1px solid var(--darkroom-border)" }}
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          {!editing && (
            <div className="relative mb-4">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search archive…"
                className="w-full px-3 py-2 text-xs border-b bg-transparent focus:outline-none" style={{ color: "var(--darkroom-text-primary)", borderColor: "var(--darkroom-border)", fontFamily: "inherit" }}
              />
            </div>
          )}

          {/* Tag filter chips */}
          {allTags.length > 0 && !editing && (
            <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTag(selectedTag === tag ? null : tag);
                    haptics.light();
                  }}
                  className={`whitespace-nowrap px-3 py-1 text-xs font-medium transition-colors shrink-0 border ${selectedTag === tag ? "border-amber-400 text-amber-400" : "border-zinc-600 text-zinc-600"}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Year slider */}
          {years.length > 1 && !editing && (
            <div className="mb-6 pb-4 border-b border" style={{ borderColor: "var(--darkroom-border)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--darkroom-text-secondary)" }}>
                  Year
                </span>
                {selectedYear && (
                  <button
                    onClick={() => {
                      setSelectedYear(null);
                      haptics.light();
                    }}
                    className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                  >
                    View All
                  </button>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedYear(year);
                      haptics.light();
                    }}
                    className={`whitespace-nowrap px-4 py-2 text-xs font-medium transition-colors border ${(selectedYear ?? years[0]) === year ? "border-amber-400 text-amber-400" : "border-zinc-600 text-zinc-600"}`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {filteredRolls.length === 0 && (searchQuery || selectedTag) && (
            <p className="text-zinc-400 text-center py-12 text-sm">
              No rolls match {selectedTag ? `#${selectedTag}` : `"${search}"`}
            </p>
          )}

          {/* Content */}
          <div className="space-y-8">
            {yearsToShow.map((year) => {
              const yearRolls = byYear.get(year);
              if (!yearRolls) return null;
              const yearNums = yearRolls.map((r) => r.roll_number);
              const allYearSelected = yearNums.every((n) => selected.has(n));
              function toggleYear() {
                setSelected((prev) => {
                  const s = new Set(prev);
                  if (allYearSelected) {
                    yearNums.forEach((n) => s.delete(n));
                    haptics.light();
                  } else {
                    yearNums.forEach((n) => s.add(n));
                    haptics.medium();
                  }
                  return s;
                });
              }
              return (
                <section key={year}>
                  <div className="flex items-baseline justify-between mb-3">
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-lg font-bold">{year}</h2>
                      <span className="text-sm text-zinc-500">
                        {yearRolls.length} roll
                        {yearRolls.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {editing && (
                      <button
                        onClick={toggleYear}
                        className={`text-[13px] font-medium active:opacity-50 transition-opacity ${allYearSelected ? "text-amber-500 dark:text-amber-400" : "text-zinc-400 dark:text-zinc-500"}`}
                      >
                        {allYearSelected ? "Deselect" : "Select all"}
                      </button>
                    )}
                  </div>
                  {view === "grid" ? (
                    <div className="space-y-2">
                      {yearRolls.map((roll) => (
                        <GridCard
                          key={roll.roll_number}
                          roll={roll}
                          editing={editing}
                          selected={selected.has(roll.roll_number)}
                          onToggle={() => toggleSelect(roll.roll_number)}
                        />
                      ))}
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {yearRolls.map((roll) => (
                        <ListRow
                          key={roll.roll_number}
                          roll={roll}
                          editing={editing}
                          selected={selected.has(roll.roll_number)}
                          onToggle={() => toggleSelect(roll.roll_number)}
                        />
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </PullToRefresh>

      {/* Edit-mode action bar — portalled to body to escape PageTransition transform */}
      {editing &&
        mounted &&
        createPortal(
          <div
            className="fixed bottom-0 inset-x-0 z-20 flex justify-center items-end gap-3 pointer-events-none px-4"
            style={{
              paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))",
            }}
          >
            <div
              className="pointer-events-auto h-14 flex items-center gap-2 px-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl shadow-black/25 dark:shadow-black/60 border border-zinc-200/70 dark:border-zinc-700/60"
              style={{
                transformOrigin: "center bottom",
                animation: exiting
                  ? "editBarFlipOut 0.22s cubic-bezier(0.4,0,1,1) forwards"
                  : "editBarFlipIn 0.28s cubic-bezier(0,0,0.2,1) forwards",
              }}
            >
              <button
                onClick={exitEdit}
                disabled={exiting}
                className="text-[15px] font-semibold text-amber-500 dark:text-amber-400 px-1 active:opacity-50 transition-opacity disabled:opacity-40"
              >
                Done
              </button>
              <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700" />
              <button
                onClick={selectAll}
                className={`text-[13px] font-medium px-1 active:opacity-50 transition-opacity ${allSelected ? "text-amber-500 dark:text-amber-400" : "text-zinc-500 dark:text-zinc-400"}`}
              >
                {allSelected ? "Deselect All" : "All"}
              </button>
              {selected.size > 0 && (
                <>
                  <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700" />
                  <span className="text-[13px] text-zinc-500 tabular-nums">
                    {selected.size} selected
                  </span>
                  {availableActions.map(({ label, field, color }) => (
                    <Fragment key={field}>
                      <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700" />
                      <button
                        onClick={() => applyStatus(field)}
                        disabled={applying}
                        className={`${color} text-white text-[13px] font-medium px-3 py-1.5 rounded-2xl active:scale-95 transition-transform disabled:opacity-50`}
                      >
                        {applying ? "…" : label}
                      </button>
                    </Fragment>
                  ))}
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
