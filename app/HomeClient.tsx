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
import Sheet from "@/components/Sheet";
import FormButton from "@/components/FormButton";
const STATUS_NEXT: Partial<
  Record<string, { field: string; label: string }>
> = {
  LOADED: { field: "fridge_at", label: "To Fridge" },
  FRIDGE: { field: "lab_at",    label: "To Lab" },
  LAB:    { field: "scanned_at", label: "Scanned" },
};

const STATUS_COLOUR: Record<string, string> = {
  LOADED: "var(--status-loaded-bg)",
  FRIDGE: "var(--status-fridge-bg)",
  LAB:    "var(--status-lab-bg)",
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
  film_gradient_from: string | null;
  film_gradient_to: string | null;
};

interface HomeData {
  rolls: RollRow[];
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
      className="w-5 h-5 border-2 flex items-center justify-center shrink-0 transition-colors"
      style={{
        backgroundColor: "transparent",
        borderColor: checked
          ? "var(--accent)"
          : "var(--border)",
      }}
    >
      {checked && (
        <svg
          className="w-3 h-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
          style={{ color: "var(--accent)" }}
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

function RollItem({
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
  const cam = cameraLabel(roll);
  const film = filmLabel(roll);
  const pushPullStr =
    roll.push_pull != null
      ? `${roll.push_pull > 0 ? "+" : ""}${roll.push_pull}`
      : null;

  // Date line varies by status
  let dateLine = "";
  if (status === "LOADED") {
    dateLine = roll.shot_at
      ? new Date(roll.shot_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
      : "";
  } else if (status === "FRIDGE") {
    const d = roll.fridge_at
      ? new Date(roll.fridge_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
      : "";
    dateLine = [d, pushPullStr].filter(Boolean).join(" · ");
  } else if (status === "LAB") {
    dateLine = roll.lab_name || (roll.lab_at
      ? new Date(roll.lab_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
      : "");
  }

  const inner = (
    <div
      className="flex items-center justify-between px-4 py-3 border-b -mx-4"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div className="flex items-center gap-3">
        {editing && <Checkbox checked={selected} />}
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
            {roll.roll_number}
          </div>
          <div style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 3 }}>
            {cam && film ? `${cam} · ${film}` : cam || film || "—"}
          </div>
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        {roll.uuid?.startsWith("offline-") ? (
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: "var(--accent)" }}>
            Syncing…
          </div>
        ) : (
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: STATUS_COLOUR[status] }}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </div>
        )}
        {dateLine && (
          <div style={{ fontSize: 14, color: "var(--text-disabled)", marginTop: 2 }}>
            {dateLine}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <li>
      {editing ? (
        <div onClick={onToggle} style={{ cursor: "pointer" }}>{inner}</div>
      ) : (
        <Link href={`/roll/${roll.roll_number}`} style={{ textDecoration: "none" }}>
          {inner}
        </Link>
      )}
    </li>
  );
}

export default function HomeClient() {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
  const headers: HeadersInit = apiKey
    ? { Authorization: `Bearer ${apiKey}` }
    : {};

  const { data, isLoading } = useCachedData<HomeData>(
    ["rolls", "home"],
    async () => {
      const res = await fetch("/api/rolls/home", { headers });
      if (!res.ok) throw new Error("Failed to fetch rolls");
      return res.json();
    },
    { apiKey },
  );

  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [labSheetRoll, setLabSheetRoll] = useState<string | null>(null);
  const [labName, setLabName] = useState("");
  const [labSubmitting, setLabSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for SW sync success messages to refresh roll list
  useEffect(() => {
    function handleSwMessage(event: MessageEvent) {
      if (event.data?.type === "SYNC_SUCCESS") {
        invalidateCache("rolls");
        router.refresh();
      }
    }
    navigator.serviceWorker?.addEventListener("message", handleSwMessage);
    return () => navigator.serviceWorker?.removeEventListener("message", handleSwMessage);
  }, [router]);

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

  async function advanceSingle(rollNumber: string, field: string) {
    await fetch(`/api/rolls/${rollNumber}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ [field]: new Date().toISOString() }),
    });
    invalidateCache("rolls");
    haptics.success();
    router.refresh();
  }

  function openLabSheet(rollNumber: string) {
    setLabSheetRoll(rollNumber);
    setLabName("");
    haptics.light();
  }

  async function handleLabSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!labSheetRoll || labSubmitting) return;
    setLabSubmitting(true);
    haptics.medium();
    await fetch(`/api/rolls/${labSheetRoll}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({
        lab_at: new Date().toISOString(),
        ...(labName.trim() ? { lab_name: labName.trim() } : {}),
      }),
    });
    invalidateCache("rolls");
    haptics.success();
    setLabSubmitting(false);
    setLabSheetRoll(null);
    router.refresh();
  }

  if (!mounted || (isLoading && !data)) {
    return (
      <div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="px-5 py-3 border-b animate-pulse" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="h-4 w-14 mb-2 rounded" style={{ backgroundColor: "var(--border)" }} />
            <div className="h-3 w-36 mb-1 rounded" style={{ backgroundColor: "var(--border-subtle)" }} />
            <div className="h-3 w-20 rounded" style={{ backgroundColor: "var(--border-subtle)" }} />
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-16">
        <div style={{ color: "var(--text-secondary)" }}>No data available</div>
      </div>
    );
  }

  const { rolls } = data;

  const loaded = rolls.filter((r) => rollStatus(r) === "LOADED");
  const inFridge = rolls.filter((r) => rollStatus(r) === "FRIDGE");
  const atLab = rolls.filter((r) => rollStatus(r) === "LAB");

  // Derive available bulk actions from the statuses of selected rolls
  const rollMap = new Map(rolls.map((r) => [r.roll_number, r]));
  const seenFields = new Set<string>();
  const availableActions: Array<{
    field: string;
    label: string;
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
      <PullToRefresh onRefresh={async () => { router.refresh(); }}>
        <div>
          {/* Page header */}
          <div
            className="flex items-center justify-between border-b"
            style={{ borderColor: "var(--border)", padding: "12px 16px 14px", margin: "0 -16px" }}
          >
            <h1 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-primary)" }}>
              Rolls
            </h1>
            {rolls.length > 0 && !editing && (
              <button
                onClick={enterEdit}
                style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-tertiary)", background: "none", border: "none", cursor: "pointer" }}
              >
                Edit
              </button>
            )}
          </div>

          {rolls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <p className="text-center" style={{ fontSize: 17, color: "var(--text-tertiary)", lineHeight: 1.6 }}>
                No active rolls.<br />
                Tap <strong style={{ color: "var(--accent)" }}>+ Load</strong> to start one.
              </p>
            </div>
          ) : (
            <div className="pb-24">
              <ul>
                {[...loaded, ...inFridge, ...atLab].map((roll) => (
                  <RollItem
                    key={roll.roll_number}
                    roll={roll}
                    editing={editing}
                    selected={selected.has(roll.roll_number)}
                    onToggle={() => toggleSelect(roll.roll_number)}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      </PullToRefresh>

      {/* Edit-mode action bar — portalled to body to escape PageTransition transform */}
      <Sheet
        open={labSheetRoll !== null}
        onClose={() => setLabSheetRoll(null)}
        title="Send to Lab"
      >
        <form onSubmit={handleLabSubmit} className="space-y-6">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b5a52", display: "block" }}>
              Lab name <span style={{ textTransform: "none", fontWeight: 400, letterSpacing: 0 }}>(optional)</span>
            </label>
            <input
              type="text"
              value={labName}
              onChange={(e) => setLabName(e.target.value)}
              placeholder="e.g. The Darkroom"
              autoFocus
              style={{
                width: "100%", background: "none", border: "none",
                borderBottom: "1px solid var(--sheet-border)",
                padding: "8px 0", fontSize: 17, fontFamily: "inherit",
                color: "var(--sheet-text)", outline: "none", caretColor: "var(--accent)",
              }}
            />
          </div>
          <FormButton type="submit" disabled={labSubmitting}>
            {labSubmitting ? "Sending…" : "Send to Lab"}
          </FormButton>
        </form>
      </Sheet>

      {editing &&
        mounted &&
        createPortal(
          <div
            className="fixed bottom-0 inset-x-0 z-20 flex justify-center items-end gap-3 pointer-events-none px-4"
            style={{
              paddingBottom: "calc(1rem + env(safe-area-inset-bottom) + 72px)",
            }}
          >
            <div
              className="pointer-events-auto h-12 flex items-center gap-3 px-4 border"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
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
                style={{ color: "var(--accent)" }}
              >
                DONE
              </button>
              <div
                className="w-px h-4"
                style={{ backgroundColor: "var(--border)" }}
              />
              {selected.size === 0 ? (
                <span
                  className="text-xs px-1"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Select rolls…
                </span>
              ) : (
                <>
                  <span
                    className="text-xs tabular-nums"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {selected.size} selected
                  </span>
                  {availableActions.map(({ label, field }) => (
                    <Fragment key={field}>
                      <div
                        className="w-px h-4"
                        style={{ backgroundColor: "var(--border)" }}
                      />
                      <button
                        onClick={() => applyStatus(field)}
                        disabled={applying}
                        className="text-xs font-medium px-3 py-1.5 border active:scale-95 transition-transform disabled:opacity-50"
                        style={{
                          color: "var(--accent)",
                          borderColor: "var(--accent)",
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
          </div>,
          document.body,
        )}
    </>
  );
}
