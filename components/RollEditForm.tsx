"use client";

import { useState, useEffect } from "react";
import type { Roll, Camera, Film, CatalogFilm } from "@/lib/db";
import { invalidateCache } from "@/lib/cache";
import FormButton from "@/components/FormButton";
import Sheet from "@/components/Sheet";
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

const labelCls = "block text-[9px] uppercase tracking-wider mb-2";
const inputCls = "w-full bg-transparent border-b py-2 text-base focus:outline-none transition-colors";
const textareaCls = "w-full bg-transparent border-b py-2 text-base focus:outline-none transition-colors resize-none";
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
  const [shotAt, setShotAt] = useState(
    roll.shot_at ? new Date(roll.shot_at).toISOString().slice(0, 10) : ""
  );
  const [notes, setNotes] = useState(roll.notes ?? "");
  const [tags, setTags] = useState(
    roll.tags ? roll.tags.join(", ") : ""
  );
  const [albumName, setAlbumName] = useState(roll.album_name ?? "");
  const [pushPull, setPushPull] = useState<number | null>(roll.push_pull ?? null);
  const [pushPullCustom, setPushPullCustom] = useState(
    roll.push_pull !== null && ![−2, −1, 0, 1, 2].includes(roll.push_pull)
      ? String(roll.push_pull)
      : ""
  );
  const [expanded, setExpanded] = useState(false);
  const [showNewCamera, setShowNewCamera] = useState(false);
  const [showNewFilm, setShowNewFilm] = useState(false);
  const [filmPickerOpen, setFilmPickerOpen] = useState(false);
  const [cameraPickerOpen, setCameraPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
  const authHeaders: HeadersInit = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};

  const cameras = [...allCameras].sort((a, b) => (b.roll_count ?? 0) - (a.roll_count ?? 0));
  const films = [...allFilms].sort((a, b) => (b.roll_count ?? 0) - (a.roll_count ?? 0));

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
      const currentShotAt = roll.shot_at ? new Date(roll.shot_at).toISOString().slice(0, 10) : "";
      if (shotAt !== currentShotAt) {
        updates.shot_at = shotAt || null;
      }
      if (notes !== (roll.notes ?? "")) {
        updates.notes = notes || null;
      }
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
      onClose();
    } catch {
      setError("Failed to update roll");
      haptics.error();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Sheet open={true} onClose={onClose} onExpand={setExpanded} title="Edit Roll">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primary fields */}
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

          {/* Hint to drag up for more options */}
          {!expanded && (
            <p className="text-[11px] text-center -mt-2" style={{ color: "var(--darkroom-text-tertiary)" }}>
              Drag up for date, notes, tags &amp; more
            </p>
          )}

          {/* Extra fields — revealed by dragging the sheet up */}
          {expanded && (
            <>
              <div className="space-y-1">
                <label className={labelCls} style={{ color: "var(--darkroom-text-tertiary)" }}>Shot date</label>
                <input
                  type="date"
                  value={shotAt}
                  onChange={(e) => setShotAt(e.target.value)}
                  className={inputCls}
                  style={{
                    borderColor: "var(--darkroom-border)",
                    color: "var(--darkroom-text-primary)",
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className={labelCls} style={{ color: "var(--darkroom-text-tertiary)" }}>Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className={textareaCls}
                  style={{
                    borderColor: "var(--darkroom-border)",
                    color: "var(--darkroom-text-primary)",
                  }}
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
                  {[−2, −1, 0, 1, 2].map((v) => {
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
            </>
          )}

          {error && <p className="text-xs tracking-wide" style={{ color: "var(--error-color, #ef4444)" }}>{error}</p>}

          <FormButton type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </FormButton>
        </form>
      </Sheet>

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
    </>
  );
}
