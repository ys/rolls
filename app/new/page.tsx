"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Camera, Film, CatalogFilm } from "@/lib/db";
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
const addLinkCls = "text-xs transition-colors";

export default function NewRollPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [allCameras, setAllCameras] = useState<Camera[]>([]);
  const [allFilms, setAllFilms] = useState<Film[]>([]);
  const [catalogFilms, setCatalogFilms] = useState<CatalogFilm[]>([]);
  const [suggestedNumber, setSuggestedNumber] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [cameraId, setCameraId] = useState("");
  const [filmId, setFilmId] = useState("");
  const [shotAt, setShotAt] = useState(new Date().toISOString().slice(0, 10));
  const [tags, setTags] = useState("");
  const [albumName, setAlbumName] = useState("");
  const [pushPull, setPushPull] = useState<number | null>(null);
  const [pushPullCustom, setPushPullCustom] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [showNewCamera, setShowNewCamera] = useState(false);
  const [showNewFilm, setShowNewFilm] = useState(false);
  const [filmPickerOpen, setFilmPickerOpen] = useState(false);
  const [cameraPickerOpen, setCameraPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
  const authHeaders: HeadersInit = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};

  useEffect(() => {
    Promise.all([
      fetch("/api/cameras", { headers: authHeaders }).then((r) => r.json()),
      fetch("/api/films", { headers: authHeaders }).then((r) => r.json()),
      fetch("/api/rolls/next", { headers: authHeaders }).then((r) => r.json()),
      fetch("/api/catalog/films").then((r) => r.json()).catch(() => []),
    ]).then(([cams, fils, next, catalog]: [Camera[], Film[], { roll_number: string }, CatalogFilm[]]) => {
      setAllCameras(cams);
      setAllFilms(fils);
      setCatalogFilms(catalog);
      setSuggestedNumber(next.roll_number);
      setRollNumber(next.roll_number);
      setOpen(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cameras = [...allCameras].sort((a, b) => (b.roll_count ?? 0) - (a.roll_count ?? 0));
  const films = [...allFilms].sort((a, b) => (b.roll_count ?? 0) - (a.roll_count ?? 0));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const resp = await fetch("/api/rolls", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          roll_number: rollNumber,
          camera_id: cameraId || undefined,
          film_id: filmId || undefined,
          shot_at: shotAt || undefined,
          tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
          album_name: albumName || undefined,
          push_pull: pushPull ?? undefined,
        }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setError(data.error ?? "Failed to create roll");
        haptics.error();
        return;
      }

      const roll = await resp.json();
      invalidateCache("rolls");
      haptics.success();
      setOpen(false);
      router.push(`/roll/${roll.roll_number}`);
    } catch {
      setError("Network error — please try again");
      haptics.error();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
    <Sheet open={open} onClose={() => router.back()} onExpand={setExpanded} title="New Roll">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Primary fields */}
        <div className="space-y-1">
          <label className={labelCls} style={{ color: "var(--darkroom-text-tertiary)" }}>Roll #</label>
          <input
            type="text"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            placeholder={suggestedNumber}
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
            Drag up for date, tags &amp; more
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
          </>
        )}

        {error && <p className="text-xs tracking-wide" style={{ color: "var(--error-color, #ef4444)" }}>{error}</p>}

        <FormButton type="submit" disabled={saving}>
          {saving ? "Creating…" : "Create Roll"}
        </FormButton>
      </form>
    </Sheet>

    <NewCameraSheet
      open={showNewCamera}
      onClose={() => setShowNewCamera(false)}
      authHeaders={authHeaders}
      onCreated={(camera) => {
        setAllCameras((prev) => [...prev, camera]);
        setCameraId(camera.slug);
        setShowNewCamera(false);
      }}
    />

    <NewFilmSheet
      open={showNewFilm}
      onClose={() => setShowNewFilm(false)}
      authHeaders={authHeaders}
      onCreated={(film) => {
        setAllFilms((prev) => [...prev, film]);
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
