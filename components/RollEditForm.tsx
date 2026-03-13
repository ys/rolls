"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Roll, Camera, Film, CatalogFilm } from "@/lib/db";
import { invalidateCache } from "@/lib/cache";
import FormButton from "@/components/FormButton";
import BackButton from "@/components/BackButton";
import NewCameraSheet from "@/components/NewCameraSheet";
import NewFilmSheet from "@/components/NewFilmSheet";
import FilmPickerSheet from "@/components/FilmPickerSheet";
import CameraPickerSheet from "@/components/CameraPickerSheet";
import { haptics } from "@/lib/haptics";

function cameraLabel(c: Camera): string {
  return c.nickname ?? `${c.brand} ${c.model}`;
}

function filmLabel(f: Film): string {
  if (f.nickname) return f.nickname;
  const iso = f.show_iso && f.iso ? ` ${f.iso}` : "";
  return `${f.brand} ${f.name}${iso}`;
}

function toDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

const labelCls = "block text-[9px] uppercase tracking-wider mb-2";
const inputCls = "w-full bg-transparent border-b py-2 text-base focus:outline-none transition-colors";
const addLinkCls = "text-xs transition-colors";

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
  // Find slugs from UUIDs
  const initialCameraSlug = allCameras.find((c) => c.uuid === roll.camera_uuid)?.slug ?? "";
  const initialFilmSlug = allFilms.find((f) => f.uuid === roll.film_uuid)?.slug ?? "";

  const [rollNumber, setRollNumber] = useState(roll.roll_number);
  const [cameraId, setCameraId] = useState(initialCameraSlug);
  const [filmId, setFilmId] = useState(initialFilmSlug);
  const [shotAt, setShotAt] = useState(toDateInput(roll.shot_at));
  const [loadedAt, setLoadedAt] = useState(toDateInput(roll.loaded_at));
  const [fridgeAt, setFridgeAt] = useState(toDateInput(roll.fridge_at));
  const [labAt, setLabAt] = useState(toDateInput(roll.lab_at));
  const [labName, setLabName] = useState(roll.lab_name ?? "");
  const [scannedAt, setScannedAt] = useState(toDateInput(roll.scanned_at));
  const [processedAt, setProcessedAt] = useState(toDateInput(roll.processed_at));
  const [archivedAt, setArchivedAt] = useState(toDateInput(roll.archived_at));
  const [tags, setTags] = useState(
    roll.tags ? roll.tags.join(", ") : ""
  );
  const [albumName, setAlbumName] = useState(roll.album_name ?? "");
  const [pushPull, setPushPull] = useState<number | null>(roll.push_pull ?? null);
  const [pushPullCustom, setPushPullCustom] = useState(
    roll.push_pull !== null && ![-2, -1, 0, 1, 2].includes(roll.push_pull)
      ? String(roll.push_pull)
      : ""
  );
  const [showNewCamera, setShowNewCamera] = useState(false);
  const [showNewFilm, setShowNewFilm] = useState(false);
  const [filmPickerOpen, setFilmPickerOpen] = useState(false);
  const [cameraPickerOpen, setCameraPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
  const authHeaders: HeadersInit = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};

  const cameras = [...allCameras].sort((a, b) => (b.roll_count ?? 0) - (a.roll_count ?? 0));
  const films = [...allFilms].sort((a, b) => (b.roll_count ?? 0) - (a.roll_count ?? 0));

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = () => {
    haptics.light();
    onClose();
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const updates: Record<string, unknown> = {};

      if (rollNumber !== roll.roll_number) {
        updates.roll_number = rollNumber;
      }
      if (cameraId !== initialCameraSlug) {
        updates.camera_id = cameraId || null;
      }
      if (filmId !== initialFilmSlug) {
        updates.film_id = filmId || null;
      }
      if (shotAt !== toDateInput(roll.shot_at)) updates.shot_at = shotAt || null;
      if (loadedAt !== toDateInput(roll.loaded_at)) updates.loaded_at = loadedAt || null;
      if (fridgeAt !== toDateInput(roll.fridge_at)) updates.fridge_at = fridgeAt || null;
      if (labAt !== toDateInput(roll.lab_at)) updates.lab_at = labAt || null;
      if (labName !== (roll.lab_name ?? "")) updates.lab_name = labName || null;
      if (scannedAt !== toDateInput(roll.scanned_at)) updates.scanned_at = scannedAt || null;
      if (processedAt !== toDateInput(roll.processed_at)) updates.processed_at = processedAt || null;
      if (archivedAt !== toDateInput(roll.archived_at)) updates.archived_at = archivedAt || null;
      const currentTags = roll.tags ? roll.tags.join(", ") : "";
      if (tags !== currentTags) {
        updates.tags = tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : null;
      }
      if (albumName !== (roll.album_name ?? "")) {
        updates.album_name = albumName || null;
      }
      if (pushPull !== roll.push_pull) {
        updates.push_pull = pushPull;
      }

      await onSave(updates as Partial<Roll>);
      haptics.success();
      handleClose();
    } catch {
      setError("Failed to update roll");
      haptics.error();
    } finally {
      setSaving(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-50 flex flex-col overflow-hidden"
        style={{
          backgroundColor: "var(--darkroom-bg)",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-4 border-b shrink-0"
          style={{ borderColor: "var(--darkroom-border)" }}
        >
          <BackButton onClick={handleClose} />
          <h1
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: "var(--darkroom-text-primary)" }}
          >
            Edit Roll
          </h1>
          <div className="w-8" />
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
            <div className="space-y-1">
              <label className={labelCls} style={{ color: "var(--darkroom-text-tertiary)" }}>Roll #</label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                required
                className={inputCls}
                style={{
                  borderColor: "var(--darkroom-border)",
                  color: "var(--darkroom-text-primary)",
                }}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className={labelCls} style={{ color: "var(--darkroom-text-tertiary)" }}>Camera</label>
                <button
                  type="button"
                  onClick={() => setShowNewCamera(true)}
                  className={addLinkCls}
                  style={{ color: "var(--darkroom-text-tertiary)" }}
                >
                  + new
                </button>
              </div>
              {cameras.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setShowNewCamera(true)}
                  className="block py-2 text-sm transition-colors"
                  style={{ color: "var(--darkroom-text-tertiary)" }}
                >
                  + Add a camera first
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCameraPickerOpen(true)}
                  className="w-full appearance-none rounded-none bg-transparent border-b py-2 text-base focus:outline-none transition-colors pr-6 text-left flex items-center justify-between"
                  style={{
                    borderColor: "var(--darkroom-border)",
                    color: cameraId ? "var(--darkroom-text-primary)" : "var(--darkroom-text-tertiary)",
                  }}
                >
                  <span>
                    {cameraId
                      ? (cameras.find((c) => c.slug === cameraId) ? cameraLabel(cameras.find((c) => c.slug === cameraId)!) : cameraId)
                      : "— select —"}
                  </span>
                  <span style={{ color: "var(--darkroom-text-tertiary)" }}>▾</span>
                </button>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className={labelCls} style={{ color: "var(--darkroom-text-tertiary)" }}>Film</label>
                <button
                  type="button"
                  onClick={() => setShowNewFilm(true)}
                  className={addLinkCls}
                  style={{ color: "var(--darkroom-text-tertiary)" }}
                >
                  + new
                </button>
              </div>
              <button
                type="button"
                onClick={() => setFilmPickerOpen(true)}
                className="w-full appearance-none rounded-none bg-transparent border-b py-2 text-base focus:outline-none transition-colors pr-6 text-left flex items-center justify-between"
                style={{
                  borderColor: "var(--darkroom-border)",
                  color: filmId ? "var(--darkroom-text-primary)" : "var(--darkroom-text-tertiary)",
                }}
              >
                <span>
                  {filmId
                    ? (films.find((f) => f.slug === filmId)?.nickname ??
                       catalogFilms.find((f) => f.slug === filmId)?.nickname ??
                       filmId)
                    : "— select —"}
                </span>
                <span style={{ color: "var(--darkroom-text-tertiary)" }}>▾</span>
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className={labelCls} style={{ color: "var(--darkroom-text-tertiary)" }}>Shot date</label>
                {shotAt ? <button type="button" onClick={() => setShotAt("")} className="text-[9px] uppercase tracking-wider transition-opacity active:opacity-50" style={{ color: "var(--darkroom-text-tertiary)" }}>Clear</button> : <button type="button" onClick={() => setShotAt(todayStr())} className="text-[9px] uppercase tracking-wider transition-opacity active:opacity-50" style={{ color: "var(--darkroom-text-tertiary)" }}>Now</button>}
              </div>
              <input
                type="date"
                value={shotAt}
                onChange={(e) => setShotAt(e.target.value)}
                className={inputCls}
                style={{ borderColor: "var(--darkroom-border)", color: shotAt ? "var(--darkroom-text-primary)" : "var(--darkroom-text-tertiary)" }}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className={labelCls} style={{ color: "var(--darkroom-text-tertiary)" }}>Loaded date</label>
                {loadedAt ? <button type="button" onClick={() => setLoadedAt("")} className="text-[9px] uppercase tracking-wider transition-opacity active:opacity-50" style={{ color: "var(--darkroom-text-tertiary)" }}>Clear</button> : <button type="button" onClick={() => setLoadedAt(todayStr())} className="text-[9px] uppercase tracking-wider transition-opacity active:opacity-50" style={{ color: "var(--darkroom-text-tertiary)" }}>Now</button>}
              </div>
              <input
                type="date"
                value={loadedAt}
                onChange={(e) => setLoadedAt(e.target.value)}
                className={inputCls}
                style={{ borderColor: "var(--darkroom-border)", color: loadedAt ? "var(--darkroom-text-primary)" : "var(--darkroom-text-tertiary)" }}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className={labelCls} style={{ color: "var(--darkroom-text-tertiary)" }}>Fridge date</label>
                {fridgeAt ? <button type="button" onClick={() => setFridgeAt("")} className="text-[9px] uppercase tracking-wider transition-opacity active:opacity-50" style={{ color: "var(--darkroom-text-tertiary)" }}>Clear</button> : <button type="button" onClick={() => setFridgeAt(todayStr())} className="text-[9px] uppercase tracking-wider transition-opacity active:opacity-50" style={{ color: "var(--darkroom-text-tertiary)" }}>Now</button>}
              </div>
              <input
                type="date"
                value={fridgeAt}
                onChange={(e) => setFridgeAt(e.target.value)}
                className={inputCls}
                style={{ borderColor: "var(--darkroom-border)", color: fridgeAt ? "var(--darkroom-text-primary)" : "var(--darkroom-text-tertiary)" }}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className={labelCls} style={{ color: "var(--darkroom-text-tertiary)" }}>Lab date</label>
                {labAt ? <button type="button" onClick={() => { setLabAt(""); setLabName(""); }} className="text-[9px] uppercase tracking-wider transition-opacity active:opacity-50" style={{ color: "var(--darkroom-text-tertiary)" }}>Clear</button> : <button type="button" onClick={() => setLabAt(todayStr())} className="text-[9px] uppercase tracking-wider transition-opacity active:opacity-50" style={{ color: "var(--darkroom-text-tertiary)" }}>Now</button>}
              </div>
              <input
                type="date"
                value={labAt}
                onChange={(e) => setLabAt(e.target.value)}
                className={inputCls}
                style={{ borderColor: "var(--darkroom-border)", color: labAt ? "var(--darkroom-text-primary)" : "var(--darkroom-text-tertiary)" }}
              />
            </div>

            {labAt && (
              <div className="space-y-1">
                <label className={labelCls} style={{ color: "var(--darkroom-text-tertiary)" }}>Lab name</label>
                <input
                  type="text"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  placeholder="e.g. The Darkroom"
                  className={inputCls}
                  style={{ borderColor: "var(--darkroom-border)", color: "var(--darkroom-text-primary)" }}
                />
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className={labelCls} style={{ color: "var(--darkroom-text-tertiary)" }}>Scanned date</label>
                {scannedAt ? <button type="button" onClick={() => setScannedAt("")} className="text-[9px] uppercase tracking-wider transition-opacity active:opacity-50" style={{ color: "var(--darkroom-text-tertiary)" }}>Clear</button> : <button type="button" onClick={() => setScannedAt(todayStr())} className="text-[9px] uppercase tracking-wider transition-opacity active:opacity-50" style={{ color: "var(--darkroom-text-tertiary)" }}>Now</button>}
              </div>
              <input
                type="date"
                value={scannedAt}
                onChange={(e) => setScannedAt(e.target.value)}
                className={inputCls}
                style={{ borderColor: "var(--darkroom-border)", color: scannedAt ? "var(--darkroom-text-primary)" : "var(--darkroom-text-tertiary)" }}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className={labelCls} style={{ color: "var(--darkroom-text-tertiary)" }}>Processed date</label>
                {processedAt ? <button type="button" onClick={() => setProcessedAt("")} className="text-[9px] uppercase tracking-wider transition-opacity active:opacity-50" style={{ color: "var(--darkroom-text-tertiary)" }}>Clear</button> : <button type="button" onClick={() => setProcessedAt(todayStr())} className="text-[9px] uppercase tracking-wider transition-opacity active:opacity-50" style={{ color: "var(--darkroom-text-tertiary)" }}>Now</button>}
              </div>
              <input
                type="date"
                value={processedAt}
                onChange={(e) => setProcessedAt(e.target.value)}
                className={inputCls}
                style={{ borderColor: "var(--darkroom-border)", color: processedAt ? "var(--darkroom-text-primary)" : "var(--darkroom-text-tertiary)" }}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className={labelCls} style={{ color: "var(--darkroom-text-tertiary)" }}>Archived date</label>
                {archivedAt ? <button type="button" onClick={() => setArchivedAt("")} className="text-[9px] uppercase tracking-wider transition-opacity active:opacity-50" style={{ color: "var(--darkroom-text-tertiary)" }}>Clear</button> : <button type="button" onClick={() => setArchivedAt(todayStr())} className="text-[9px] uppercase tracking-wider transition-opacity active:opacity-50" style={{ color: "var(--darkroom-text-tertiary)" }}>Now</button>}
              </div>
              <input
                type="date"
                value={archivedAt}
                onChange={(e) => setArchivedAt(e.target.value)}
                className={inputCls}
                style={{ borderColor: "var(--darkroom-border)", color: archivedAt ? "var(--darkroom-text-primary)" : "var(--darkroom-text-tertiary)" }}
              />
            </div>

            <div className="space-y-1">
              <label className={labelCls} style={{ color: "var(--darkroom-text-tertiary)" }}>Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="street, portrait, travel"
                className={inputCls}
                style={{
                  borderColor: "var(--darkroom-border)",
                  color: "var(--darkroom-text-primary)",
                }}
              />
            </div>

            <div className="space-y-1">
              <label className={labelCls} style={{ color: "var(--darkroom-text-tertiary)" }}>Album name</label>
              <input
                type="text"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                className={inputCls}
                style={{
                  borderColor: "var(--darkroom-border)",
                  color: "var(--darkroom-text-primary)",
                }}
              />
            </div>

            <div className="space-y-2">
              <label className={labelCls} style={{ color: "var(--darkroom-text-tertiary)" }}>Push / Pull</label>
              <div className="flex gap-1 flex-wrap">
                {[-2, -1, 0, 1, 2].map((v) => {
                  const label = v > 0 ? `+${v}` : `${v}`;
                  const active = pushPull === v && pushPullCustom === "";
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => {
                        if (active) { setPushPull(null); setPushPullCustom(""); }
                        else { setPushPull(v); setPushPullCustom(""); }
                      }}
                      className="px-3 py-1 rounded-full text-sm font-mono border transition-colors"
                      style={active ? {
                        backgroundColor: "var(--darkroom-accent)",
                        borderColor: "var(--darkroom-accent)",
                        color: "#000",
                      } : {
                        borderColor: "var(--darkroom-border)",
                        color: "var(--darkroom-text-tertiary)",
                      }}
                    >{label}</button>
                  );
                })}
                <input
                  type="number"
                  step="0.5"
                  value={pushPullCustom}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setPushPullCustom(raw);
                    setPushPull(raw !== "" ? parseFloat(raw) : null);
                  }}
                  placeholder="other"
                  className="w-16 appearance-none rounded-none bg-transparent border-b py-1 text-sm text-center font-mono focus:outline-none transition-colors"
                  style={{
                    borderColor: "var(--darkroom-border)",
                    color: "var(--darkroom-text-primary)",
                  }}
                />
              </div>
            </div>

            {error && <p className="text-xs tracking-wide" style={{ color: "var(--error-color, #ef4444)" }}>{error}</p>}

            <FormButton type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </FormButton>
          </form>
        </div>
      </div>

      <NewCameraSheet
        open={showNewCamera}
        onClose={() => setShowNewCamera(false)}
        authHeaders={authHeaders}
        onCreated={(camera) => {
          setCameraId(camera.slug);
          setShowNewCamera(false);
        }}
      />

      <NewFilmSheet
        open={showNewFilm}
        onClose={() => setShowNewFilm(false)}
        authHeaders={authHeaders}
        onCreated={(film) => {
          setFilmId(film.slug);
          setShowNewFilm(false);
        }}
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
