"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Camera, Film } from "@/lib/db";
import { invalidateCache } from "@/lib/cache";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "markdown-toolbar": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { for: string }, HTMLElement>;
      "md-bold": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-italic": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-strikethrough": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-link": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-unordered-list": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-ordered-list": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-task-list": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-code": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-quote": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

function cameraLabel(c: Camera): string {
  return c.nickname ?? `${c.brand} ${c.model}`;
}

function filmLabel(f: Film): string {
  if (f.nickname) return f.nickname;
  const iso = f.show_iso && f.iso ? ` ${f.iso}` : "";
  return `${f.brand} ${f.name}${iso}`;
}

export default function NewRollPage() {
  const router = useRouter();
  const [allCameras, setAllCameras] = useState<Camera[]>([]);
  const [allFilms, setAllFilms] = useState<Film[]>([]);
  const [suggestedNumber, setSuggestedNumber] = useState("");
  const [form, setForm] = useState({
    roll_number: "",
    camera_id: "",
    film_id: "",
    shot_at: new Date().toISOString().slice(0, 10),
    notes: "",
    tags: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Inline camera add
  const [showAddCamera, setShowAddCamera] = useState(false);
  const [cameraForm, setCameraForm] = useState({ brand: "", model: "", nickname: "" });
  const [addingCamera, setAddingCamera] = useState(false);

  // Inline film add
  const [showAddFilm, setShowAddFilm] = useState(false);
  const [filmForm, setFilmForm] = useState({ brand: "", name: "", nickname: "", iso: "" });
  const [addingFilm, setAddingFilm] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
  const authHeaders: HeadersInit = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};

  useEffect(() => {
    import("@github/markdown-toolbar-element");
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/cameras", { headers: authHeaders }).then((r) => r.json()),
      fetch("/api/films", { headers: authHeaders }).then((r) => r.json()),
      fetch("/api/rolls/next", { headers: authHeaders }).then((r) => r.json()),
    ]).then(([cams, fils, next]: [Camera[], Film[], { roll_number: string }]) => {
      setAllCameras(cams);
      setAllFilms(fils);
      setSuggestedNumber(next.roll_number);
      setForm((f) => ({ ...f, roll_number: next.roll_number }));
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cameras = [...allCameras].sort((a, b) => (b.roll_count ?? 0) - (a.roll_count ?? 0));
  const films = [...allFilms].sort((a, b) => (b.roll_count ?? 0) - (a.roll_count ?? 0));

  async function handleAddCamera(e: React.FormEvent) {
    e.preventDefault();
    setAddingCamera(true);
    const resp = await fetch("/api/cameras", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ brand: cameraForm.brand, model: cameraForm.model, nickname: cameraForm.nickname || null, format: 135 }),
    });
    if (resp.ok) {
      const camera: Camera = await resp.json();
      setAllCameras((prev) => [...prev, camera]);
      setForm((f) => ({ ...f, camera_id: camera.slug }));
      setShowAddCamera(false);
      setCameraForm({ brand: "", model: "", nickname: "" });
    }
    setAddingCamera(false);
  }

  async function handleAddFilm(e: React.FormEvent) {
    e.preventDefault();
    setAddingFilm(true);
    const resp = await fetch("/api/films", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ brand: filmForm.brand, name: filmForm.name, nickname: filmForm.nickname || null, iso: filmForm.iso ? parseInt(filmForm.iso, 10) : null, color: true, show_iso: false }),
    });
    if (resp.ok) {
      const film: Film = await resp.json();
      setAllFilms((prev) => [...prev, film]);
      setForm((f) => ({ ...f, film_id: film.slug }));
      setShowAddFilm(false);
      setFilmForm({ brand: "", name: "", nickname: "", iso: "" });
    }
    setAddingFilm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...authHeaders,
    };

    const body = {
      ...form,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
    };

    const resp = await fetch("/api/rolls", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const data = await resp.json();
      setError(data.error ?? "Failed to create roll");
      setSaving(false);
      return;
    }

    const roll = await resp.json();

    // Invalidate rolls cache so home page refreshes
    invalidateCache("rolls");

    router.push(`/roll/${roll.roll_number}`);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">New Roll</h1>
        <button
          onClick={() => router.back()}
          className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">Roll #</label>
          <input
            type="text"
            required
            value={form.roll_number}
            onChange={(e) => setForm((f) => ({ ...f, roll_number: e.target.value }))}
            placeholder={suggestedNumber}
            className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">Shot at</label>
          <input
            type="date"
            value={form.shot_at}
            onChange={(e) => setForm((f) => ({ ...f, shot_at: e.target.value }))}
            className="w-full appearance-none bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20"
          />
        </div>

        {/* Camera */}
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">Camera</label>
          <div className="relative">
            <select
              value={form.camera_id}
              onChange={(e) => setForm((f) => ({ ...f, camera_id: e.target.value }))}
              className="w-full appearance-none bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20 pr-10"
            >
              <option value="">— select —</option>
              {cameras.map((c) => (
                <option key={c.slug} value={c.slug}>{cameraLabel(c)}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400">▾</span>
          </div>
          <button
            type="button"
            onClick={() => { setShowAddCamera((v) => !v); setCameraForm({ brand: "", model: "", nickname: "" }); }}
            className="mt-1.5 text-[13px] text-amber-600 dark:text-amber-400 px-1"
          >
            {showAddCamera ? "− Cancel" : "+ Add new camera"}
          </button>
          {showAddCamera && (
            <div className="mt-2 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Brand *</label>
                  <input type="text" required value={cameraForm.brand} onChange={(e) => setCameraForm((f) => ({ ...f, brand: e.target.value }))} placeholder="Nikon" className="w-full bg-white dark:bg-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Model *</label>
                  <input type="text" required value={cameraForm.model} onChange={(e) => setCameraForm((f) => ({ ...f, model: e.target.value }))} placeholder="F3" className="w-full bg-white dark:bg-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Nickname</label>
                <input type="text" value={cameraForm.nickname} onChange={(e) => setCameraForm((f) => ({ ...f, nickname: e.target.value }))} placeholder="optional" className="w-full bg-white dark:bg-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20" />
              </div>
              <button type="button" disabled={!cameraForm.brand || !cameraForm.model || addingCamera} onClick={handleAddCamera} className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black py-2 rounded-lg text-sm font-medium active:scale-95 transition-transform disabled:opacity-40">
                {addingCamera ? "Adding…" : "Add Camera"}
              </button>
            </div>
          )}
        </div>

        {/* Film */}
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">Film</label>
          <div className="relative">
            <select
              value={form.film_id}
              onChange={(e) => setForm((f) => ({ ...f, film_id: e.target.value }))}
              className="w-full appearance-none bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20 pr-10"
            >
              <option value="">— select —</option>
              {films.map((f) => (
                <option key={f.slug} value={f.slug}>{filmLabel(f)}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400">▾</span>
          </div>
          <button
            type="button"
            onClick={() => { setShowAddFilm((v) => !v); setFilmForm({ brand: "", name: "", nickname: "", iso: "" }); }}
            className="mt-1.5 text-[13px] text-amber-600 dark:text-amber-400 px-1"
          >
            {showAddFilm ? "− Cancel" : "+ Add new film"}
          </button>
          {showAddFilm && (
            <div className="mt-2 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Brand *</label>
                  <input type="text" required value={filmForm.brand} onChange={(e) => setFilmForm((f) => ({ ...f, brand: e.target.value }))} placeholder="Kodak" className="w-full bg-white dark:bg-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Name *</label>
                  <input type="text" required value={filmForm.name} onChange={(e) => setFilmForm((f) => ({ ...f, name: e.target.value }))} placeholder="Gold 200" className="w-full bg-white dark:bg-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Nickname</label>
                  <input type="text" value={filmForm.nickname} onChange={(e) => setFilmForm((f) => ({ ...f, nickname: e.target.value }))} placeholder="optional" className="w-full bg-white dark:bg-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">ISO</label>
                  <input type="text" inputMode="numeric" value={filmForm.iso} onChange={(e) => setFilmForm((f) => ({ ...f, iso: e.target.value }))} placeholder="200" className="w-full bg-white dark:bg-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20" />
                </div>
              </div>
              <button type="button" disabled={!filmForm.brand || !filmForm.name || addingFilm} onClick={handleAddFilm} className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black py-2 rounded-lg text-sm font-medium active:scale-95 transition-transform disabled:opacity-40">
                {addingFilm ? "Adding…" : "Add Film"}
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">Tags</label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            placeholder="travel, street, portrait"
            className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">Notes</label>
          <markdown-toolbar for="new-notes-textarea" className="flex flex-wrap gap-1 mb-2">
            <md-bold><button type="button" className="px-2 py-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm font-bold transition-colors">B</button></md-bold>
            <md-italic><button type="button" className="px-2 py-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm italic transition-colors">I</button></md-italic>
            <md-strikethrough><button type="button" className="px-2 py-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm transition-colors line-through">S</button></md-strikethrough>
            <md-link><button type="button" className="px-2 py-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm transition-colors">Link</button></md-link>
            <md-unordered-list><button type="button" className="px-2 py-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm transition-colors">• List</button></md-unordered-list>
            <md-ordered-list><button type="button" className="px-2 py-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm transition-colors">1. List</button></md-ordered-list>
            <md-task-list><button type="button" className="px-2 py-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm transition-colors">☐ Task</button></md-task-list>
            <md-code><button type="button" className="px-2 py-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm font-mono transition-colors">&lt;/&gt;</button></md-code>
            <md-quote><button type="button" className="px-2 py-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm transition-colors">❝</button></md-quote>
          </markdown-toolbar>
          <textarea
            id="new-notes-textarea"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={4}
            placeholder="Write notes in markdown…"
            className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20 resize-none font-mono"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black py-4 rounded-xl font-semibold text-base active:scale-95 transition-transform disabled:opacity-50"
        >
          {saving ? "Creating…" : "Create Roll"}
        </button>
      </form>
    </div>
  );
}
