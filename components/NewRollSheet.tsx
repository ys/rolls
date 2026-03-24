"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Camera, Film, CatalogFilm } from "@/lib/db";
import { invalidateCache } from "@/lib/cache";
import { useCachedData } from "@/hooks/useCachedData";
import Sheet from "@/components/Sheet";
import NewCameraSheet from "@/components/NewCameraSheet";
import NewFilmSheet from "@/components/NewFilmSheet";
import FilmPickerSheet from "@/components/FilmPickerSheet";
import CameraPickerSheet from "@/components/CameraPickerSheet";
import { haptics } from "@/lib/haptics";

function cameraLabel(c: Camera): string {
  return c.nickname ?? `${c.brand} ${c.model}`;
}

function filmLabel(f: Film | CatalogFilm): string {
  if (f.nickname) return f.nickname;
  return `${f.brand} ${f.name}`;
}

export default function NewRollSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [catalogFilms, setCatalogFilms] = useState<CatalogFilm[]>([]);
  const [rollNumber, setRollNumber] = useState("");
  const [cameraId, setCameraId] = useState("");
  const [filmId, setFilmId] = useState("");
  const [showNewCamera, setShowNewCamera] = useState(false);
  const [showNewFilm, setShowNewFilm] = useState(false);
  const [filmPickerOpen, setFilmPickerOpen] = useState(false);
  const [cameraPickerOpen, setCameraPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
  const authHeaders: HeadersInit = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};

  // Use cached data so the sheet works offline (populated by CachePrimer on first online load)
  const { data: camerasData } = useCachedData<Camera[]>(
    ["cameras"],
    () => fetch("/api/cameras", { headers: authHeaders }).then((r) => r.json()),
    { apiKey },
  );
  const { data: filmsData } = useCachedData<Film[]>(
    ["films"],
    () => fetch("/api/films", { headers: authHeaders }).then((r) => r.json()),
    { apiKey },
  );
  const { data: nextData } = useCachedData<{ roll_number: string }>(
    ["rolls", "next"],
    () => fetch("/api/rolls/next", { headers: authHeaders }).then((r) => r.json()),
    { apiKey },
  );

  const [allCameras, setAllCameras] = useState<Camera[]>([]);
  const [allFilms, setAllFilms] = useState<Film[]>([]);

  // Merge cached data with any locally added cameras/films (added via "+ New" while offline)
  useEffect(() => {
    if (camerasData) setAllCameras((prev) => {
      const ids = new Set(camerasData.map((c) => c.uuid));
      return [...camerasData, ...prev.filter((c) => !ids.has(c.uuid))];
    });
  }, [camerasData]);

  useEffect(() => {
    if (filmsData) setAllFilms((prev) => {
      const ids = new Set(filmsData.map((f) => f.uuid));
      return [...filmsData, ...prev.filter((f) => !ids.has(f.uuid))];
    });
  }, [filmsData]);

  // Set roll number from cache/network, but only if user hasn't typed yet
  useEffect(() => {
    if (nextData?.roll_number && rollNumber === "") {
      setRollNumber(nextData.roll_number);
    }
  }, [nextData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Catalog films — static-ish list, plain fetch with graceful fallback
  useEffect(() => {
    if (!open) return;
    fetch("/api/catalog/films").then((r) => r.json()).then(setCatalogFilms).catch(() => {});
  }, [open]);

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
          shot_at: new Date().toISOString().slice(0, 10),
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
      onClose();
      router.push(`/roll/${roll.roll_number}`);
    } catch {
      setError("Network error — please try again");
      haptics.error();
    } finally {
      setSaving(false);
    }
  }

  const selectedCamera = cameras.find((c) => c.slug === cameraId);
  const selectedFilm = films.find((f) => f.slug === filmId) ?? catalogFilms.find((f) => f.slug === filmId);

  const fieldLabel: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
    color: "#6b5a52", display: "block", marginBottom: 4,
  };

  const pickerRow: React.CSSProperties = {
    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "none", border: "none", borderBottom: "1px solid var(--sheet-border)",
    padding: "10px 0", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
  };

  return (
    <>
      <Sheet open={open} onClose={onClose} title="New Roll">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Roll number — hero input */}
          <div>
            <label style={fieldLabel}>Roll #</label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="e.g. 26x01"
              required
              style={{
                width: "100%", background: "none", border: "none",
                borderBottom: "1px solid var(--sheet-border)",
                padding: "8px 0", fontSize: 28, fontWeight: 700,
                color: "var(--sheet-text)", fontFamily: "inherit",
                outline: "none", caretColor: "var(--accent)",
              }}
            />
          </div>

          {/* Camera */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={fieldLabel}>Camera</span>
              <button type="button" onClick={() => setShowNewCamera(true)} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                + New
              </button>
            </div>
            {cameras.length === 0 ? (
              <button type="button" onClick={() => setShowNewCamera(true)} style={{ ...pickerRow, color: "#6b5a52", fontSize: 17 }}>
                + Add a camera first
              </button>
            ) : (
              <button type="button" onClick={() => setCameraPickerOpen(true)} style={pickerRow}>
                <span style={{ fontSize: 17, color: cameraId ? "var(--sheet-text)" : "#6b5a52" }}>
                  {selectedCamera ? cameraLabel(selectedCamera) : "— select —"}
                </span>
                <span style={{ color: "#6b5a52", fontSize: 14 }}>▾</span>
              </button>
            )}
          </div>

          {/* Film */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={fieldLabel}>Film</span>
              <button type="button" onClick={() => setShowNewFilm(true)} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                + New
              </button>
            </div>
            <button type="button" onClick={() => setFilmPickerOpen(true)} style={pickerRow}>
              <span style={{ fontSize: 17, color: filmId ? "var(--sheet-text)" : "#6b5a52" }}>
                {selectedFilm ? filmLabel(selectedFilm) : "— select —"}
              </span>
              <span style={{ color: "#6b5a52", fontSize: 14 }}>▾</span>
            </button>
          </div>

          {error && <p style={{ fontSize: 13, color: "#c2410c", margin: 0 }}>{error}</p>}

          <button
            type="submit"
            disabled={saving}
            style={{
              width: "100%", padding: "14px 0", marginTop: 4,
              backgroundColor: saving ? "var(--sheet-border)" : "var(--accent)",
              color: "#fff", border: "none",
              cursor: saving ? "not-allowed" : "pointer",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
              fontFamily: "inherit",
            }}
          >
            {saving ? "Loading…" : "+ Load Roll"}
          </button>
        </form>
      </Sheet>

      <NewCameraSheet
        open={showNewCamera}
        onClose={() => setShowNewCamera(false)}
        authHeaders={authHeaders}
        onCreated={(camera) => { setAllCameras((prev) => [...prev, camera]); setCameraId(camera.slug); setShowNewCamera(false); }}
      />
      <NewFilmSheet
        open={showNewFilm}
        onClose={() => setShowNewFilm(false)}
        authHeaders={authHeaders}
        onCreated={(film) => { setAllFilms((prev) => [...prev, film]); setFilmId(film.slug); setShowNewFilm(false); }}
      />
      <FilmPickerSheet
        open={filmPickerOpen}
        onClose={() => setFilmPickerOpen(false)}
        films={films}
        catalogFilms={catalogFilms}
        value={filmId}
        onChange={setFilmId}
        onAddNew={() => setShowNewFilm(true)}
      />
      <CameraPickerSheet
        open={cameraPickerOpen}
        onClose={() => setCameraPickerOpen(false)}
        cameras={cameras}
        value={cameraId}
        onChange={setCameraId}
        onAddNew={() => setShowNewCamera(true)}
      />
    </>
  );
}
