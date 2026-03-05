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

// Status options for bulk edit — progression steps for scanned rolls
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

interface ArchiveData {
  rolls: RollRow[];
}

function rollYear(roll: RollRow): number {
  const match = roll.roll_number.match(/^(\d{2})x/);
  if (match) return 2000 + parseInt(match[1], 10);
  if (roll.scanned_at) return new Date(roll.scanned_at).getFullYear();
  return new Date().getFullYear();
}

function filmLabel(roll: RollRow): string {
  if (roll.film_nickname) return roll.film_nickname;
  if (roll.film_brand && roll.film_name) {
    const iso = roll.film_show_iso && roll.film_iso ? ` ${roll.film_iso}` : "";
    return `${roll.film_brand} ${roll.film_name}${iso}`;
  }
  return roll.film_id ?? "";
}

function PlaceholderSheet({ rollNumber }: { rollNumber: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 dark:bg-zinc-900 select-none">
      <div className="absolute top-0 inset-x-0 flex justify-around px-1 py-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-2 h-1.5 rounded-sm bg-zinc-700 dark:bg-zinc-800" />
        ))}
      </div>
      <span className="text-zinc-500 text-[11px] font-mono tracking-widest uppercase px-2 text-center">
        {rollNumber}
      </span>
      <div className="absolute bottom-0 inset-x-0 flex justify-around px-1 py-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-2 h-1.5 rounded-sm bg-zinc-700 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}

function ArchiveCard({
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
  const label = filmLabel(roll);

  if (editing) {
    return (
      <button
        onClick={() => { onToggle(); haptics.light(); }}
        className={`relative aspect-square rounded-lg overflow-hidden bg-zinc-800 w-full transition-transform active:scale-95 ${selected ? "ring-2 ring-amber-400 ring-offset-1 ring-offset-gray-50 dark:ring-offset-zinc-950" : ""}`}
      >
        {roll.contact_sheet_url ? (
          <img src={roll.contact_sheet_url} alt={roll.roll_number} className="w-full h-full object-cover" />
        ) : (
          <PlaceholderSheet rollNumber={roll.roll_number} />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent pt-4 pb-1.5 px-2">
          <div className="text-white text-[11px] font-semibold font-mono leading-tight truncate">{roll.roll_number}</div>
          {label && <div className="text-white/60 text-[10px] truncate leading-tight">{label}</div>}
        </div>
        {/* Checkbox */}
        <div className={`absolute top-1.5 left-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selected ? "bg-amber-400 border-amber-400" : "bg-black/30 border-white/60"}`}>
          {selected && (
            <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${STATUS_DOT[status] ?? "bg-zinc-400"} shadow-sm`} />
      </button>
    );
  }

  return (
    <Link
      href={`/roll/${roll.roll_number}`}
      onClick={() => haptics.light()}
      className="block relative aspect-square rounded-lg overflow-hidden bg-zinc-800 active:scale-95 transition-transform"
    >
      {roll.contact_sheet_url ? (
        <img src={roll.contact_sheet_url} alt={roll.roll_number} className="w-full h-full object-cover" />
      ) : (
        <PlaceholderSheet rollNumber={roll.roll_number} />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent pt-4 pb-1.5 px-2">
        <div className="text-white text-[11px] font-semibold font-mono leading-tight truncate">{roll.roll_number}</div>
        {label && <div className="text-white/60 text-[10px] truncate leading-tight">{label}</div>}
      </div>
      <div className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${STATUS_DOT[status] ?? "bg-zinc-400"} shadow-sm`} />
    </Link>
  );
}

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
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState(false);

  function toggleSelect(rollNumber: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(rollNumber)) next.delete(rollNumber); else next.add(rollNumber);
      return next;
    });
  }

  function enterEdit() { setEditing(true); setSelected(new Set()); haptics.medium(); }
  function exitEdit() { setEditing(false); setSelected(new Set()); }

  async function applyStatus(field: string) {
    if (selected.size === 0 || applying) return;
    setApplying(true);
    haptics.medium();

    const now = new Date().toISOString();
    await fetch("/api/rolls/bulk-update", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ roll_numbers: [...selected], field, value: now }),
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
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
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
          No scanned rolls yet.<br />Scanned rolls appear here.
        </p>
      </div>
    );
  }

  const byYear = new Map<number, RollRow[]>();
  for (const roll of data.rolls) {
    const year = rollYear(roll);
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(roll);
  }
  const years = Array.from(byYear.keys()).sort((a, b) => b - a);

  return (
    <>
      <PullToRefresh onRefresh={async () => { router.refresh(); }}>
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Archive</h1>
            {editing ? (
              <button
                onClick={exitEdit}
                className="text-sm font-medium text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Done
              </button>
            ) : (
              <button
                onClick={enterEdit}
                className="text-sm font-medium text-zinc-500 dark:text-zinc-400 px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Edit
              </button>
            )}
          </div>

          {editing && (
            <p className="text-[13px] text-zinc-500 -mt-3 mb-5">
              {selected.size === 0 ? "Tap rolls to select" : `${selected.size} selected`}
            </p>
          )}

          <div className="space-y-8">
            {years.map((year) => {
              const yearRolls = byYear.get(year)!;
              return (
                <section key={year}>
                  <div className="flex items-baseline gap-2 mb-3">
                    <h2 className="text-lg font-bold">{year}</h2>
                    <span className="text-sm text-zinc-500">
                      {yearRolls.length} roll{yearRolls.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {yearRolls.map((roll) => (
                      <ArchiveCard
                        key={roll.roll_number}
                        roll={roll}
                        editing={editing}
                        selected={selected.has(roll.roll_number)}
                        onToggle={() => toggleSelect(roll.roll_number)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </PullToRefresh>

      {/* Bulk status action bar — slides up when items are selected in edit mode */}
      {editing && selected.size > 0 && (
        <div
          className="fixed inset-x-0 z-20 flex justify-center px-4"
          style={{ bottom: "calc(6rem + env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center gap-2 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/60 border border-zinc-200/70 dark:border-zinc-700/60 px-3 py-2">
            <span className="text-[12px] text-zinc-500 mr-1">Mark as</span>
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
          </div>
        </div>
      )}
    </>
  );
}
