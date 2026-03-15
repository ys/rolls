"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Camera, Film, CatalogFilm } from "@/lib/db";
import { invalidateCache } from "@/lib/cache";
import NewCameraSheet from "@/components/NewCameraSheet";
import NewFilmSheet from "@/components/NewFilmSheet";
import FilmPickerSheet from "@/components/FilmPickerSheet";
import CameraPickerSheet from "@/components/CameraPickerSheet";
import { haptics } from "@/lib/haptics";

function cameraLabel(c: Camera): string {
  return c.nickname ?? `${c.brand} ${c.model}`;
}

export default function NewRollPage() {
  const router = useRouter();
  const [allCameras, setAllCameras] = useState<Camera[]>([]);
  const [allFilms, setAllFilms] = useState<Film[]>([]);
  const [catalogFilms, setCatalogFilms] = useState<CatalogFilm[]>([]);
  const [suggestedNumber, setSuggestedNumber] = useState("");
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
      router.push(`/roll/${roll.roll_number}`);
    } catch {
      setError("Network error — please try again");
      haptics.error();
    } finally {
      setSaving(false);
    }
  }

  const fieldLabel: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
    color: "var(--text-tertiary)", marginBottom: 4, display: "block",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "none", border: "none", borderBottom: "1px solid var(--border)",
    padding: "10px 0", fontSize: 17, color: "var(--text-primary)", fontFamily: "inherit",
    outline: "none", caretColor: "var(--accent)",
  };

  const pickerRow: React.CSSProperties = {
    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "none", border: "none", borderBottom: "1px solid var(--border)",
    padding: "10px 0", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
  };

  return (
    <>
      <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", backgroundColor: "var(--bg)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", padding: "16px 0 12px", borderBottom: "1px solid var(--border)", flexShrink: 0, marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => { haptics.light(); router.back(); }}
            style={{ fontSize: 22, color: "var(--text-primary)", background: "none", border: "none", cursor: "pointer", lineHeight: 1, padding: "0 12px 0 0", fontFamily: "inherit" }}
          >
            ‹
          </button>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Load Roll
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
          {/* Roll number */}
          <div>
            <label style={fieldLabel}>Roll #</label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder={suggestedNumber}
              required
              style={{ ...inputStyle, fontSize: 17, fontWeight: 700 }}
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
              <button type="button" onClick={() => setShowNewCamera(true)} style={{ ...pickerRow, color: "var(--text-tertiary)", fontSize: 17 }}>
                + Add a camera first
              </button>
            ) : (
              <button type="button" onClick={() => setCameraPickerOpen(true)} style={pickerRow}>
                <span style={{ fontSize: 17, color: cameraId ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                  {cameraId ? (cameras.find((c) => c.slug === cameraId) ? cameraLabel(cameras.find((c) => c.slug === cameraId)!) : cameraId) : "— select —"}
                </span>
                <span style={{ color: "var(--text-tertiary)", fontSize: 13 }}>▾</span>
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
              <span style={{ fontSize: 17, color: filmId ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                {filmId
                  ? (films.find((f) => f.slug === filmId)?.nickname ?? catalogFilms.find((f) => f.slug === filmId)?.nickname ?? filmId)
                  : "— select —"}
              </span>
              <span style={{ color: "var(--text-tertiary)", fontSize: 13 }}>▾</span>
            </button>
          </div>

          {error && <p style={{ fontSize: 13, color: "#c2410c", margin: 0 }}>{error}</p>}

          <div style={{ marginTop: "auto", paddingBottom: 8 }}>
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
              {saving ? "Loading…" : "+ Load Roll"}
            </button>
          </div>
        </form>
      </div>

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
