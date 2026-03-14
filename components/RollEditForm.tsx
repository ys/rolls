"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Roll, Camera, Film, CatalogFilm } from "@/lib/db";
import NewCameraSheet from "@/components/NewCameraSheet";
import NewFilmSheet from "@/components/NewFilmSheet";
import FilmPickerSheet from "@/components/FilmPickerSheet";
import CameraPickerSheet from "@/components/CameraPickerSheet";
import { haptics } from "@/lib/haptics";

function cameraLabel(c: Camera): string {
  return c.nickname ?? `${c.brand} ${c.model}`;
}

function toDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

interface RollEditFormProps {
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
  cameras: Camera[];
  films: Film[];
  catalogFilms: CatalogFilm[];
  onClose: () => void;
  onSave: (updates: Partial<Roll>) => Promise<void>;
}

export default function RollEditForm({
  roll,
  cameras: allCameras,
  films: allFilms,
  catalogFilms,
  onClose,
  onSave,
}: RollEditFormProps) {
  const initialCameraSlug = allCameras.find((c) => c.uuid === roll.camera_uuid)?.slug ?? "";
  const initialFilmSlug = allFilms.find((f) => f.uuid === roll.film_uuid)?.slug ?? "";

  const [rollNumber, setRollNumber] = useState(roll.roll_number);
  const [cameraId, setCameraId] = useState(initialCameraSlug);
  const [filmId, setFilmId] = useState(initialFilmSlug);
  const [shotAt, setShotAt] = useState(toDateInput(roll.shot_at));
  const [fridgeAt, setFridgeAt] = useState(toDateInput(roll.fridge_at));
  const [labAt, setLabAt] = useState(toDateInput(roll.lab_at));
  const [labName, setLabName] = useState(roll.lab_name ?? "");
  const [scannedAt, setScannedAt] = useState(toDateInput(roll.scanned_at));
  const [processedAt, setProcessedAt] = useState(toDateInput(roll.processed_at));
  const [archivedAt, setArchivedAt] = useState(toDateInput(roll.archived_at));
  const [tags, setTags] = useState(roll.tags ? roll.tags.join(", ") : "");
  const [albumName, setAlbumName] = useState(roll.album_name ?? "");
  const [pushPull, setPushPull] = useState<number>(roll.push_pull ?? 0);
  const [showNewCamera, setShowNewCamera] = useState(false);
  const [showNewFilm, setShowNewFilm] = useState(false);
  const [filmPickerOpen, setFilmPickerOpen] = useState(false);
  const [cameraPickerOpen, setCameraPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  // Offset for "skip" on next-step card
  const [nextStepSkip, setNextStepSkip] = useState(0);

  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
  const authHeaders: HeadersInit = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};

  const cameras = [...allCameras].sort((a, b) => (b.roll_count ?? 0) - (a.roll_count ?? 0));
  const films = [...allFilms].sort((a, b) => (b.roll_count ?? 0) - (a.roll_count ?? 0));

  useEffect(() => { setMounted(true); }, []);

  // The full date chain in order
  const dateChain = [
    { key: "shot_at",      label: "Shot",      value: shotAt,      setValue: setShotAt,           extra: null },
    { key: "fridge_at",    label: "Fridge",    value: fridgeAt,    setValue: setFridgeAt,         extra: null },
    { key: "lab_at",       label: "Lab",       value: labAt,       setValue: setLabAt,            extra: "lab_name" },
    { key: "scanned_at",   label: "Scanned",   value: scannedAt,   setValue: setScannedAt,        extra: null },
    { key: "processed_at", label: "Processed", value: processedAt, setValue: setProcessedAt,      extra: null },
    { key: "archived_at",  label: "Archived",  value: archivedAt,  setValue: setArchivedAt,       extra: null },
  ] as const;

  // Index of first unset date
  const firstUnsetIdx = dateChain.findIndex((s) => !s.value);
  // "Next step" index accounts for skips
  const rawNextIdx = firstUnsetIdx === -1 ? -1 : firstUnsetIdx + nextStepSkip;
  const nextStepIdx = rawNextIdx >= dateChain.length ? -1 : rawNextIdx;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updates: Record<string, unknown> = {};
      if (rollNumber !== roll.roll_number) updates.roll_number = rollNumber;
      if (cameraId !== initialCameraSlug) updates.camera_id = cameraId || null;
      if (filmId !== initialFilmSlug) updates.film_id = filmId || null;
      if (shotAt !== toDateInput(roll.shot_at)) updates.shot_at = shotAt || null;
      if (fridgeAt !== toDateInput(roll.fridge_at)) updates.fridge_at = fridgeAt || null;
      if (labAt !== toDateInput(roll.lab_at)) updates.lab_at = labAt || null;
      if (labName !== (roll.lab_name ?? "")) updates.lab_name = labName || null;
      if (scannedAt !== toDateInput(roll.scanned_at)) updates.scanned_at = scannedAt || null;
      if (processedAt !== toDateInput(roll.processed_at)) updates.processed_at = processedAt || null;
      if (archivedAt !== toDateInput(roll.archived_at)) updates.archived_at = archivedAt || null;
      const currentTags = roll.tags ? roll.tags.join(", ") : "";
      if (tags !== currentTags) updates.tags = tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : null;
      if (albumName !== (roll.album_name ?? "")) updates.album_name = albumName || null;
      const pp = pushPull === 0 ? null : pushPull;
      if (pp !== roll.push_pull) updates.push_pull = pp;
      await onSave(updates as Partial<Roll>);
      haptics.success();
      onClose();
    } catch {
      setError("Failed to update roll");
      haptics.error();
    } finally {
      setSaving(false);
    }
  }

  if (!mounted) return null;

  const sectionLabel: React.CSSProperties = {
    fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
    color: "var(--text-tertiary)", marginBottom: 12,
  };

  const fieldLabel: React.CSSProperties = {
    fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
    color: "var(--text-tertiary)",
  };

  const pickerRow: React.CSSProperties = {
    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "none", border: "none", borderBottom: "1px solid var(--border)",
    padding: "10px 0", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
  };

  return createPortal(
    <>
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 50, display: "flex", flexDirection: "column",
          backgroundColor: "var(--bg)",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", padding: "16px 16px 12px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => { haptics.light(); onClose(); }}
            style={{ fontSize: 22, color: "var(--text-primary)", background: "none", border: "none", cursor: "pointer", lineHeight: 1, padding: "0 8px 0 0", fontFamily: "inherit" }}
          >
            ‹
          </button>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-primary)", flex: 1 }}>
            {roll.roll_number}
          </span>
        </div>

        {/* Scrollable form */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <form onSubmit={handleSubmit} style={{ padding: "0 16px 32px" }}>

            {/* ── Section: Roll ── */}
            <div style={{ paddingTop: 24, paddingBottom: 8 }}>
              <div style={sectionLabel}>Roll</div>

              {/* Roll number */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ ...fieldLabel, marginBottom: 4 }}>Roll #</div>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  required
                  style={{
                    width: "100%", background: "none", border: "none", borderBottom: "1px solid var(--border)",
                    padding: "8px 0", fontSize: 14, color: "var(--text-primary)", fontFamily: "inherit", outline: "none",
                    caretColor: "var(--accent)",
                  }}
                />
              </div>

              {/* Camera */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={fieldLabel}>Camera</div>
                  <button type="button" onClick={() => setShowNewCamera(true)} style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                    + New
                  </button>
                </div>
                <button type="button" onClick={() => setCameraPickerOpen(true)} style={{ ...pickerRow }}>
                  <span style={{ fontSize: 14, color: cameraId ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                    {cameraId ? (cameras.find((c) => c.slug === cameraId) ? cameraLabel(cameras.find((c) => c.slug === cameraId)!) : cameraId) : "— select —"}
                  </span>
                  <span style={{ color: "var(--text-tertiary)", fontSize: 12 }}>▾</span>
                </button>
              </div>

              {/* Film */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={fieldLabel}>Film</div>
                  <button type="button" onClick={() => setShowNewFilm(true)} style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                    + New
                  </button>
                </div>
                <button type="button" onClick={() => setFilmPickerOpen(true)} style={{ ...pickerRow }}>
                  <span style={{ fontSize: 14, color: filmId ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                    {filmId
                      ? (films.find((f) => f.slug === filmId)?.nickname ?? catalogFilms.find((f) => f.slug === filmId)?.nickname ?? filmId)
                      : "— select —"}
                  </span>
                  <span style={{ color: "var(--text-tertiary)", fontSize: 12 }}>▾</span>
                </button>
              </div>

              {/* Push/Pull stepper */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ ...fieldLabel, marginBottom: 12 }}>Push / Pull</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
                  <button
                    type="button"
                    onClick={() => { if (pushPull > -3) { setPushPull(pushPull - 1); haptics.light(); } }}
                    disabled={pushPull <= -3}
                    style={{
                      width: 44, height: 44, border: "1px solid var(--border)", background: "none", cursor: "pointer",
                      fontSize: 18, color: pushPull <= -3 ? "var(--text-disabled)" : "var(--text-primary)",
                      fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    −
                  </button>
                  <div style={{ width: 72, textAlign: "center", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", fontFamily: "inherit" }}>
                    {pushPull === 0 ? "—" : pushPull > 0 ? `+${pushPull}` : `${pushPull}`}
                  </div>
                  <button
                    type="button"
                    onClick={() => { if (pushPull < 3) { setPushPull(pushPull + 1); haptics.light(); } }}
                    disabled={pushPull >= 3}
                    style={{
                      width: 44, height: 44, border: "1px solid var(--border)", background: "none", cursor: "pointer",
                      fontSize: 18, color: pushPull >= 3 ? "var(--text-disabled)" : "var(--text-primary)",
                      fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* ── Section: Timeline ── */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, paddingBottom: 8 }}>
              <div style={sectionLabel}>Timeline</div>

              {/* Past/set dates */}
              {dateChain.map((step, idx) => {
                const isSet = !!step.value;
                // Show past/set steps that come before the next-step card
                if (!isSet && idx >= (nextStepIdx === -1 ? dateChain.length : nextStepIdx)) return null;
                if (!isSet) return null; // unset before nextStepIdx won't render (skipped steps not shown)
                if (nextStepIdx !== -1 && idx >= nextStepIdx) return null; // don't show set dates after next step

                return (
                  <div key={step.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--accent)", flexShrink: 0 }} />
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
                        {step.label}
                        {step.key === "lab_at" && labName ? ` · ${labName}` : ""}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{formatDate(step.value)}</span>
                      <button
                        type="button"
                        onClick={() => {
                          (step.setValue as (v: string) => void)("");
                          if (step.key === "lab_at") setLabName("");
                          haptics.light();
                        }}
                        style={{ fontSize: 13, color: "var(--text-tertiary)", background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1 }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Next step card */}
              {nextStepIdx !== -1 && (
                <div style={{ marginTop: 12, borderTop: "2px solid var(--accent)", backgroundColor: "#fffdf8", padding: "14px 14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 4 }}>
                        Next step
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                        {dateChain[nextStepIdx].label}
                      </div>
                    </div>
                    {nextStepIdx < dateChain.length - 1 && (
                      <button
                        type="button"
                        onClick={() => { setNextStepSkip(nextStepSkip + 1); haptics.light(); }}
                        style={{ fontSize: 11, color: "var(--text-tertiary)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                      >
                        Skip →
                      </button>
                    )}
                  </div>
                  <input
                    type="date"
                    defaultValue={todayStr()}
                    onChange={(e) => {
                      (dateChain[nextStepIdx].setValue as (v: string) => void)(e.target.value);
                      setNextStepSkip(0);
                    }}
                    style={{
                      width: "100%", background: "none", border: "none", borderBottom: "1px solid var(--border)",
                      padding: "8px 0", fontSize: 14, color: "var(--text-primary)", fontFamily: "inherit", outline: "none",
                      caretColor: "var(--accent)",
                    }}
                  />
                  {dateChain[nextStepIdx].key === "lab_at" && (
                    <input
                      type="text"
                      value={labName}
                      onChange={(e) => setLabName(e.target.value)}
                      placeholder="Lab name (optional)"
                      style={{
                        width: "100%", background: "none", border: "none", borderBottom: "1px solid var(--border)",
                        padding: "8px 0", fontSize: 14, color: "var(--text-primary)", fontFamily: "inherit", outline: "none",
                        caretColor: "var(--accent)", marginTop: 8,
                      }}
                    />
                  )}
                </div>
              )}

              {nextStepIdx === -1 && (
                <p style={{ fontSize: 12, color: "var(--text-tertiary)", fontStyle: "italic", paddingTop: 8 }}>
                  All milestones recorded.
                </p>
              )}
            </div>

            {/* ── Section: Details ── */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24 }}>
              <div style={sectionLabel}>Details</div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ ...fieldLabel, marginBottom: 4 }}>Album</div>
                <input
                  type="text"
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  placeholder="Album name"
                  style={{
                    width: "100%", background: "none", border: "none", borderBottom: "1px solid var(--border)",
                    padding: "8px 0", fontSize: 14, color: "var(--text-primary)", fontFamily: "inherit", outline: "none",
                    caretColor: "var(--accent)",
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ ...fieldLabel, marginBottom: 4 }}>Tags</div>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="street, portrait, travel"
                  style={{
                    width: "100%", background: "none", border: "none", borderBottom: "1px solid var(--border)",
                    padding: "8px 0", fontSize: 14, color: "var(--text-primary)", fontFamily: "inherit", outline: "none",
                    caretColor: "var(--accent)",
                  }}
                />
              </div>

            </div>

            {error && <p style={{ fontSize: 11, color: "#c2410c", marginBottom: 12 }}>{error}</p>}

            {/* Save button */}
            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%", padding: "14px 0",
                backgroundColor: saving ? "var(--border)" : "var(--accent)",
                color: saving ? "var(--text-tertiary)" : "#fff",
                border: "none", cursor: saving ? "not-allowed" : "pointer",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
                fontFamily: "inherit",
              }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </form>
        </div>
      </div>

      <NewCameraSheet
        open={showNewCamera}
        onClose={() => setShowNewCamera(false)}
        authHeaders={authHeaders}
        onCreated={(camera) => { setCameraId(camera.slug); setShowNewCamera(false); }}
      />
      <NewFilmSheet
        open={showNewFilm}
        onClose={() => setShowNewFilm(false)}
        authHeaders={authHeaders}
        onCreated={(film) => { setFilmId(film.slug); setShowNewFilm(false); }}
      />
      <FilmPickerSheet
        open={filmPickerOpen}
        onClose={() => setFilmPickerOpen(false)}
        films={films}
        catalogFilms={catalogFilms}
        value={filmId}
        onChange={setFilmId}
      />
      <CameraPickerSheet
        open={cameraPickerOpen}
        onClose={() => setCameraPickerOpen(false)}
        cameras={cameras}
        value={cameraId}
        onChange={setCameraId}
      />
    </>,
    document.body
  );
}
