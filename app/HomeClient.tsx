"use client";

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Camera } from "pixelarticons/react/Camera";
import { Image } from "pixelarticons/react/Image";
import { ChevronRight } from "pixelarticons/react/ChevronRight";
import { useCachedData } from "@/hooks/useCachedData";
import { rollStatus } from "@/lib/status";
import { invalidateCache } from "@/lib/cache";
import type { Roll } from "@/lib/db";
import PullToRefresh from "@/components/PullToRefresh";
import { RollSkeleton } from "@/components/Skeleton";
import { haptics } from "@/lib/haptics";

const STATUS_NEXT: Partial<Record<string, { field: string; label: string; color: string }>> = {
  LOADED: { field: "fridge_at",  label: "To Fridge", color: "bg-cyan-500"   },
  FRIDGE: { field: "lab_at",     label: "To Lab",    color: "bg-orange-500" },
  LAB:    { field: "scanned_at", label: "Scanned",   color: "bg-green-500"  },
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

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <div className={`w-5 h-5 border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-amber-400 border-amber-400" : "border-zinc-400 dark:border-zinc-600"}`}>
      {checked && (
        <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  );
}

function RollItem({ roll, editing, selected, onToggle }: {
  roll: RollRow; editing: boolean; selected: boolean; onToggle: () => void;
}) {
  const dateStr = roll.shot_at
    ? new Date(roll.shot_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null;
  const cam  = cameraLabel(roll);
  const film = filmLabel(roll);

  const inner = (
    <>
      {editing && <Checkbox checked={selected} />}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-semibold text-[15px] truncate">{roll.roll_number}</span>
          {dateStr && <span className="text-[13px] text-zinc-400 dark:text-zinc-500 shrink-0">{dateStr}</span>}
        </div>
        {(cam || film) && (
          <div className="flex items-center gap-2 mt-0.5 min-w-0">
            {cam && (
              <span className="flex items-center gap-1 text-[13px] text-zinc-500 dark:text-zinc-300 truncate">
                <Camera width={12} height={12} className="shrink-0" />{cam}
              </span>
            )}
            {cam && film && <span className="text-zinc-300 dark:text-zinc-600 text-[11px] shrink-0">·</span>}
            {film && (
              <span className="flex items-center gap-1 text-[13px] text-zinc-500 dark:text-zinc-300 truncate">
                <Image width={12} height={12} className="shrink-0" />{film}
              </span>
            )}
          </div>
        )}
      </div>
      {!editing && (
        <ChevronRight width={16} height={16} className="text-zinc-300 dark:text-zinc-600 shrink-0 mt-[3px]" />
      )}
    </>
  );

  const cls = "flex items-start gap-3 py-3 -mx-4 px-4 transition-colors border-b border-zinc-200 dark:border-zinc-800 last:border-b-0";

  if (editing) {
    return (
      <li>
        <button onClick={() => { onToggle(); haptics.light(); }} className={`${cls} w-full text-left active:bg-zinc-100 dark:active:bg-zinc-800/50`}>
          {inner}
        </button>
      </li>
    );
  }
  return (
    <li>
      <Link href={`/roll/${roll.roll_number}`} onClick={() => haptics.light()} className={`${cls} block active:bg-zinc-100 dark:active:bg-zinc-800/50`}>
        {inner}
      </Link>
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

  if (!mounted || (isLoading && !data)) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        {[1, 2, 3, 4].map((i) => <RollSkeleton key={i} />)}
      </div>
    );
  }

  if (!data) {
    return <div className="flex items-center justify-center py-16"><div className="text-zinc-400">No data available</div></div>;
  }

  const { rolls } = data;
  const loaded   = rolls.filter((r) => rollStatus(r) === "LOADED");
  const inFridge = rolls.filter((r) => rollStatus(r) === "FRIDGE");
  const atLab    = rolls.filter((r) => rollStatus(r) === "LAB");

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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Rolls</h1>
            {rolls.length > 0 && !editing && (
              <button
                onClick={enterEdit}
                className="text-sm font-medium text-zinc-500 dark:text-zinc-400 px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Edit
              </button>
            )}
          </div>

          {rolls.length === 0 ? (
            <p className="text-zinc-500 text-center py-16">No active rolls. Tap + to create one!</p>
          ) : (
            <div className="space-y-8">
              {[
                { label: "Loaded",        rolls: loaded   },
                { label: "In the Fridge", rolls: inFridge },
                { label: "At the Lab",    rolls: atLab    },
              ].map(({ label, rolls: sectionRolls }) => sectionRolls.length > 0 && (
                <section key={label}>
                  <div className="flex items-baseline justify-between mb-3">
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-lg font-bold">{label}</h2>
                      <span className="text-sm text-zinc-500">{sectionRolls.length}</span>
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
                        className={`text-[13px] font-medium active:opacity-50 transition-opacity ${sectionRolls.every((r) => selected.has(r.roll_number)) ? "text-amber-500 dark:text-amber-400" : "text-zinc-400 dark:text-zinc-500"}`}
                      >
                        {sectionRolls.every((r) => selected.has(r.roll_number)) ? "Deselect" : "Select all"}
                      </button>
                    )}
                  </div>
                  <ul>
                    {sectionRolls.map((roll) => (
                      <RollItem key={roll.roll_number} roll={roll} editing={editing} selected={selected.has(roll.roll_number)} onToggle={() => toggleSelect(roll.roll_number)} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </PullToRefresh>

      {/* Edit-mode action bar — portalled to body to escape PageTransition transform */}
      {editing && mounted && createPortal(
        <div
          className="fixed bottom-0 inset-x-0 z-20 flex pointer-events-none"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div
            className="pointer-events-auto h-14 flex items-center gap-2 px-4 bg-white dark:bg-zinc-950 border-t-2 border-zinc-900 dark:border-zinc-100 w-full"
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
            {selected.size === 0 ? (
              <span className="text-[13px] text-zinc-400 px-1">Select rolls…</span>
            ) : (
              <>
                <span className="text-[13px] text-zinc-500 tabular-nums">{selected.size} selected</span>
                {availableActions.map(({ label, field, color }) => (
                  <Fragment key={field}>
                    <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700" />
                    <button
                      onClick={() => applyStatus(field)}
                      disabled={applying}
                      className={`${color} text-white text-[13px] font-medium px-3 py-1.5 active:opacity-70 transition-opacity disabled:opacity-50`}
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
