"use client";

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useCachedData } from "@/hooks/useCachedData";
import { rollStatus } from "@/lib/status";
import { invalidateCache } from "@/lib/cache";
import type { Roll } from "@/lib/db";
import { db } from "@/lib/offline-db";
import { mergeRollUpdate, registerBackgroundSync } from "@/lib/sync-queue";
import PullToRefresh from "@/components/PullToRefresh";
import { haptics } from "@/lib/haptics";

const STATUS_NEXT: Partial<Record<string, { field: string; label: string }>> = {
  SCANNED: { field: "processed_at", label: "Processed" },
  PROCESSED: { field: "uploaded_at", label: "Uploaded" },
  UPLOADED: { field: "archived_at", label: "Archived" },
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
      style={{
        width: 20,
        height: 20,
        border: `2px solid ${checked ? "var(--accent)" : "var(--border)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        backgroundColor: "transparent",
      }}
    >
      {checked && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--accent)"
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
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px dashed var(--border)",
        position: "relative",
        backgroundColor: "var(--bg)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-around",
          padding: "4px 8px",
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{ width: 8, height: 6, backgroundColor: "var(--border)" }}
          />
        ))}
      </div>
      <span
        style={{
          color: "var(--text-tertiary)",
          fontSize: 11,
          fontFamily: "inherit",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {rollNumber}
      </span>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-around",
          padding: "4px 8px",
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{ width: 8, height: 6, backgroundColor: "var(--border)" }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Grid card (Grid D: full-bleed 16:9 + info strip) ─────────────────────────
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
  const film = filmLabel(roll);
  const camera = cameraLabel(roll);
  const pushPull =
    roll.push_pull != null
      ? roll.push_pull > 0
        ? ` +${roll.push_pull}`
        : ` ${roll.push_pull}`
      : "";
  const status = roll.archived_at
    ? "ARCHIVED"
    : roll.uploaded_at
      ? "UPLOADED"
      : roll.processed_at
        ? "PROCESSED"
        : "SCANNED";
  const statusDate =
    roll.archived_at ??
    roll.uploaded_at ??
    roll.processed_at ??
    roll.scanned_at;
  const dateStr = statusDate
    ? new Date(statusDate).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      })
    : null;

  const inner = (
    <div style={{ position: "relative" }}>
      {/* Full-bleed image — no crop, natural height */}
      <div style={{ position: "relative", width: "100%" }}>
        {roll.contact_sheet_url ? (
          <img
            src={roll.contact_sheet_url}
            alt={roll.roll_number}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        ) : (
          <div style={{ aspectRatio: "3/2" }}>
            <PlaceholderSheet rollNumber={roll.roll_number} />
          </div>
        )}
        {editing && (
          <div style={{ position: "absolute", top: 10, left: 16 }}>
            <Checkbox checked={selected} />
          </div>
        )}
      </div>
      {/* Info strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px 12px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1.2,
            }}
          >
            {roll.roll_number}
          </div>
          {(camera || film) && (
            <div
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                marginTop: 2,
              }}
            >
              {camera && film
                ? `${camera} · ${film}${pushPull}`
                : camera || `${film}${pushPull}`}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.13em",
              textTransform: "uppercase",
              color: ARCHIVE_STATUS_COLOUR[status] ?? "var(--text-disabled)",
            }}
          >
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </div>
          {dateStr && (
            <div
              style={{
                fontSize: 14,
                color: "var(--text-disabled)",
                marginTop: 2,
              }}
            >
              {dateStr}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const containerStyle: React.CSSProperties = {
    display: "block",
    textAlign: "left",
    margin: "0 -16px",
    width: "calc(100% + 32px)",
    textDecoration: "none",
  };

  if (editing) {
    return (
      <button
        onClick={() => {
          onToggle();
          haptics.light();
        }}
        style={containerStyle}
      >
        {inner}
      </button>
    );
  }
  return (
    <Link
      href={`/roll/${roll.roll_number}`}
      onClick={() => haptics.light()}
      style={containerStyle}
    >
      {inner}
    </Link>
  );
}

const ARCHIVE_STATUS_COLOUR: Record<string, string> = {
  SCANNED: "#16a34a",
  PROCESSED: "#9333ea",
  UPLOADED: "#0891b2",
  ARCHIVED: "var(--text-tertiary)",
};

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
  const camera = cameraLabel(roll);
  const film = filmLabel(roll);
  const pushPull =
    roll.push_pull != null
      ? roll.push_pull > 0
        ? ` +${roll.push_pull}`
        : ` ${roll.push_pull}`
      : "";
  const status = roll.archived_at
    ? "ARCHIVED"
    : roll.uploaded_at
      ? "UPLOADED"
      : roll.processed_at
        ? "PROCESSED"
        : "SCANNED";
  const statusDate =
    roll.archived_at ??
    roll.uploaded_at ??
    roll.processed_at ??
    roll.scanned_at;
  const dateStr = statusDate
    ? new Date(statusDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  const content = (
    <>
      {editing && <Checkbox checked={selected} />}
      {!editing && roll.contact_sheet_url && (
        <div
          style={{
            width: 52,
            height: 52,
            overflow: "hidden",
            flexShrink: 0,
            borderRadius: 2,
          }}
        >
          <img
            src={roll.contact_sheet_url}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.2,
          }}
        >
          {roll.roll_number}
        </div>
        <div
          style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 2 }}
        >
          {camera && film
            ? `${camera} · ${film}${pushPull}`
            : camera || `${film}${pushPull}` || "—"}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.13em",
            textTransform: "uppercase",
            color: ARCHIVE_STATUS_COLOUR[status] ?? "var(--text-disabled)",
          }}
        >
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </div>
        {dateStr && (
          <div
            style={{
              fontSize: 14,
              color: "var(--text-disabled)",
              marginTop: 2,
            }}
          >
            {dateStr}
          </div>
        )}
      </div>
    </>
  );

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 0",
    borderBottom: "1px solid var(--border-subtle)",
    textDecoration: "none",
  };

  if (editing) {
    return (
      <li>
        <div
          style={{ ...rowStyle, cursor: "pointer" }}
          onClick={() => {
            onToggle();
            haptics.light();
          }}
        >
          {content}
        </div>
      </li>
    );
  }
  return (
    <li>
      <Link
        href={`/roll/${roll.roll_number}`}
        onClick={() => haptics.light()}
        style={rowStyle}
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
      width="16"
      height="16"
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
      width="16"
      height="16"
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
      const result: ArchiveData = await res.json();
      // Seed db.rolls for offline writes (fire and forget)
      const records = result.rolls
        .filter((r) => !r.uuid?.startsWith("offline-"))
        .map((r) => ({
          uuid: r.uuid, roll_number: r.roll_number, user_id: r.user_id,
          camera_uuid: r.camera_uuid ?? null, film_uuid: r.film_uuid ?? null,
          loaded_at: r.loaded_at ?? null, shot_at: r.shot_at ?? null,
          fridge_at: r.fridge_at ?? null, lab_at: r.lab_at ?? null, lab_name: r.lab_name ?? null,
          scanned_at: r.scanned_at ?? null, processed_at: r.processed_at ?? null,
          uploaded_at: r.uploaded_at ?? null, archived_at: r.archived_at ?? null,
          album_name: r.album_name ?? null, tags: r.tags ?? null, notes: r.notes ?? null,
          contact_sheet_url: r.contact_sheet_url ?? null, push_pull: r.push_pull ?? null,
        }));
      if (records.length > 0) db.rolls.bulkPut(records).catch(() => {});
      return result;
    },
    { apiKey },
  );

  const router = useRouter();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [editing, setEditing] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState(false);
  // Local patches applied offline, overlaid on server data until sync
  const [localPatches, setLocalPatches] = useState<Map<string, Partial<RollRow>>>(new Map());
  const [mounted, setMounted] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      document.body.removeAttribute("data-mass-edit");
    };
  }, []);

  useEffect(() => {
    function handleSwMessage(event: MessageEvent) {
      if (event.data?.type === "SYNC_SUCCESS") {
        if (event.data.rollNumber) {
          setLocalPatches((prev) => {
            const next = new Map(prev);
            next.delete(event.data.rollNumber);
            return next;
          });
        }
        invalidateCache("rolls");
        router.refresh();
      }
    }
    navigator.serviceWorker?.addEventListener("message", handleSwMessage);
    return () => navigator.serviceWorker?.removeEventListener("message", handleSwMessage);
  }, [router]);

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
    const now = new Date().toISOString();
    if (!navigator.onLine) {
      for (const rollNumber of selected) {
        await db.rolls.where("roll_number").equals(rollNumber).modify({ [field]: now });
        setLocalPatches((prev) => new Map(prev).set(rollNumber, { ...(prev.get(rollNumber) ?? {}), [field]: now } as Partial<RollRow>));
        await mergeRollUpdate(rollNumber, { [field]: now } as Partial<Roll>, apiKey);
      }
      await registerBackgroundSync();
      haptics.success();
      setApplying(false);
      exitEdit();
      return;
    }
    try {
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
    } catch {
      haptics.error();
      setApplying(false);
    }
  }

  if (isLoading && !data) {
    return (
      <div>
        <div
          style={{
            height: 32,
            width: 64,
            backgroundColor: "var(--border)",
            marginBottom: 24,
            animation: "pulse 1.5s infinite",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: "100%",
                aspectRatio: "3/2",
                backgroundColor: "var(--border)",
                animation: "pulse 1.5s infinite",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.rolls.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "96px 0",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 32 }}>🎞️</div>
        <p
          style={{
            color: "var(--text-tertiary)",
            textAlign: "center",
            fontSize: 17,
          }}
        >
          No scanned rolls yet.
          <br />
          Scanned rolls appear here.
        </p>
      </div>
    );
  }

  // Overlay any offline patches on top of server data
  const patchedRolls = data.rolls.map((r) => ({ ...r, ...(localPatches.get(r.roll_number) ?? {}) }));

  const searchQuery = search.trim().toLowerCase();
  const filteredRolls = patchedRolls.filter((r) => {
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

  const allTags = Array.from(
    new Set(patchedRolls.flatMap((r) => r.tags ?? [])),
  ).sort();

  const byYear = new Map<number, RollRow[]>();
  for (const roll of filteredRolls) {
    const y = rollYear(roll);
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(roll);
  }
  const years = Array.from(byYear.keys()).sort((a, b) => b - a);
  const yearsToShow = selectedYear ? [selectedYear] : years;

  const rollMap = new Map(patchedRolls.map((r) => [r.roll_number, r]));
  const seenFields = new Set<string>();
  const availableActions: Array<{ field: string; label: string }> = [];
  for (const num of selected) {
    const roll = rollMap.get(num);
    if (!roll) continue;
    const next = STATUS_NEXT[rollStatus(roll)];
    if (next && !seenFields.has(next.field)) {
      seenFields.add(next.field);
      availableActions.push(next);
    }
  }

  const chipStyle = (active: boolean): React.CSSProperties => ({
    whiteSpace: "nowrap",
    padding: "4px 10px",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
    color: active ? "var(--accent)" : "var(--text-tertiary)",
    background: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    flexShrink: 0,
  });

  return (
    <>
      <PullToRefresh
        onRefresh={async () => {
          router.refresh();
        }}
      >
        <div>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 12,
              marginBottom: 20,
            }}
          >
            <h1
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--text-primary)",
              }}
            >
              ARCHIVE
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {!editing && (
                <>
                  <button
                    onClick={() => {
                      setView("list");
                      haptics.light();
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 4,
                      cursor: "pointer",
                      color:
                        view === "list"
                          ? "var(--accent)"
                          : "var(--text-tertiary)",
                    }}
                  >
                    <ListIcon active={view === "list"} />
                  </button>
                  <button
                    onClick={() => {
                      setView("grid");
                      haptics.light();
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 4,
                      cursor: "pointer",
                      color:
                        view === "grid"
                          ? "var(--accent)"
                          : "var(--text-tertiary)",
                    }}
                  >
                    <GridIcon active={view === "grid"} />
                  </button>
                  <button
                    onClick={enterEdit}
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--text-tertiary)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Search */}
          {!editing && (
            <div style={{ position: "relative", marginBottom: 12 }}>
              <svg
                style={{
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 14,
                  height: 14,
                  color: "var(--text-tertiary)",
                  pointerEvents: "none",
                }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search archive…"
                style={{
                  width: "100%",
                  paddingLeft: 20,
                  paddingRight: 0,
                  paddingTop: 8,
                  paddingBottom: 8,
                  fontSize: 17,
                  color: "var(--text-primary)",
                  background: "none",
                  border: "none",
                  borderBottom: "1px solid var(--border)",
                  fontFamily: "inherit",
                  outline: "none",
                  caretColor: "var(--accent)",
                }}
              />
            </div>
          )}

          {/* Tag filter chips */}
          {allTags.length > 0 && !editing && (
            <div
              style={{
                display: "flex",
                gap: 6,
                overflowX: "auto",
                paddingBottom: 4,
                marginBottom: 16,
              }}
            >
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTag(selectedTag === tag ? null : tag);
                    haptics.light();
                  }}
                  style={chipStyle(selectedTag === tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Year filter chips (only if multiple years) */}
          {years.length > 1 && !editing && (
            <div
              style={{
                display: "flex",
                gap: 6,
                overflowX: "auto",
                paddingBottom: 4,
                marginBottom: 20,
              }}
            >
              <button
                onClick={() => {
                  setSelectedYear(null);
                  haptics.light();
                }}
                style={chipStyle(selectedYear === null)}
              >
                All
              </button>
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => {
                    setSelectedYear(year);
                    haptics.light();
                  }}
                  style={chipStyle(selectedYear === year)}
                >
                  {year}
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {filteredRolls.length === 0 && (searchQuery || selectedTag) && (
            <p
              style={{
                color: "var(--text-tertiary)",
                textAlign: "center",
                padding: "48px 0",
                fontSize: 17,
              }}
            >
              No rolls match {selectedTag ? `#${selectedTag}` : `"${search}"`}
            </p>
          )}

          {/* Content */}
          <div style={{ paddingBottom: 96 }}>
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
                <section key={year} style={{ marginBottom: 32 }}>
                  {/* Year section header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderTop: "1px solid var(--border)",
                      paddingTop: 12,
                      marginBottom: 16,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--text-tertiary)",
                        fontVariant: "small-caps",
                      }}
                    >
                      {year} · {yearRolls.length} roll
                      {yearRolls.length !== 1 ? "s" : ""}
                    </span>
                    {editing && (
                      <button
                        onClick={toggleYear}
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: allYearSelected
                            ? "var(--accent)"
                            : "var(--text-tertiary)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        {allYearSelected ? "Deselect" : "Select all"}
                      </button>
                    )}
                  </div>
                  {view === "grid" ? (
                    <div>
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
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
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

      {/* Edit-mode action bar */}
      {editing &&
        mounted &&
        createPortal(
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 20,
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              padding: "0 16px",
              paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                pointerEvents: "auto",
                height: 56,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "0 16px",
                backgroundColor: "var(--sheet-bg)",
                border: "1px solid var(--sheet-border)",
                transformOrigin: "center bottom",
                animation: exiting
                  ? "editBarFlipOut 0.22s cubic-bezier(0.4,0,1,1) forwards"
                  : "editBarFlipIn 0.28s cubic-bezier(0,0,0.2,1) forwards",
              }}
            >
              <button
                onClick={exitEdit}
                disabled={exiting}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--accent)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  padding: "0 4px",
                }}
              >
                Done
              </button>
              <div
                style={{
                  width: 1,
                  height: 16,
                  backgroundColor: "var(--sheet-border)",
                }}
              />
              <button
                onClick={selectAll}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: allSelected ? "var(--accent)" : "var(--sheet-text)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  padding: "0 4px",
                }}
              >
                {allSelected ? "Deselect All" : "All"}
              </button>
              {selected.size > 0 && (
                <>
                  <div
                    style={{
                      width: 1,
                      height: 16,
                      backgroundColor: "var(--sheet-border)",
                    }}
                  />
                  <span
                    style={
                      {
                        fontSize: 11,
                        color: "var(--sheet-text)",
                        opacity: 0.5,
                        tabularNums: true,
                      } as React.CSSProperties
                    }
                  >
                    {selected.size} selected
                  </span>
                  {availableActions.map(({ label, field }) => (
                    <Fragment key={field}>
                      <div
                        style={{
                          width: 1,
                          height: 16,
                          backgroundColor: "var(--sheet-border)",
                        }}
                      />
                      <button
                        onClick={() => applyStatus(field)}
                        disabled={applying}
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "var(--accent)",
                          background: "none",
                          border: "1px solid var(--accent)",
                          padding: "4px 10px",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          opacity: applying ? 0.5 : 1,
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
