"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Camera, Film, Roll } from "@/lib/db";

function nextRollNumber(rolls: Roll[]): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const prefix = `${year}x`;
  const nums = rolls
    .filter((r) => r.roll_number.toLowerCase().startsWith(prefix.toLowerCase()))
    .map((r) => parseInt(r.roll_number.slice(prefix.length), 10))
    .filter((n) => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${prefix}${String(next).padStart(2, "0")}`;
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
  const [cameraCount, setCameraCount] = useState<Record<string, number>>({});
  const [filmCount, setFilmCount] = useState<Record<string, number>>({});
  const [sortBy, setSortBy] = useState<"usage" | "alpha">("usage");
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

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
    const headers: HeadersInit = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};

    Promise.all([
      fetch("/api/cameras", { headers }).then((r) => r.json()),
      fetch("/api/films", { headers }).then((r) => r.json()),
      fetch("/api/rolls", { headers }).then((r) => r.json()),
    ]).then(([cams, fils, rols]: [Camera[], Film[], Roll[]]) => {
      const cc: Record<string, number> = {};
      const fc: Record<string, number> = {};
      for (const r of rols) {
        if (r.camera_id) cc[r.camera_id] = (cc[r.camera_id] ?? 0) + 1;
        if (r.film_id)   fc[r.film_id]   = (fc[r.film_id]   ?? 0) + 1;
      }
      setAllCameras(cams);
      setAllFilms(fils);
      setCameraCount(cc);
      setFilmCount(fc);
      const suggested = nextRollNumber(rols);
      setSuggestedNumber(suggested);
      setForm((f) => ({ ...f, roll_number: suggested }));
    });
  }, []);

  const cameras = sortBy === "alpha"
    ? [...allCameras].sort((a, b) => cameraLabel(a).localeCompare(cameraLabel(b)))
    : [...allCameras].sort((a, b) => (cameraCount[b.id] ?? 0) - (cameraCount[a.id] ?? 0));

  const films = sortBy === "alpha"
    ? [...allFilms].sort((a, b) => filmLabel(a).localeCompare(filmLabel(b)))
    : [...allFilms].sort((a, b) => (filmCount[b.id] ?? 0) - (filmCount[a.id] ?? 0));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
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
    router.push(`/roll/${roll.roll_number}`);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">New Roll</h1>
        <div className="flex gap-1 text-xs bg-zinc-800 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setSortBy("usage")}
            className={`px-2 py-1 rounded-md transition-colors ${sortBy === "usage" ? "bg-white text-black font-medium" : "text-zinc-400"}`}
          >
            By usage
          </button>
          <button
            type="button"
            onClick={() => setSortBy("alpha")}
            className={`px-2 py-1 rounded-md transition-colors ${sortBy === "alpha" ? "bg-white text-black font-medium" : "text-zinc-400"}`}
          >
            A–Z
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Roll Number</label>
          <input
            type="text"
            required
            value={form.roll_number}
            onChange={(e) => setForm((f) => ({ ...f, roll_number: e.target.value }))}
            placeholder={suggestedNumber}
            className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Camera</label>
          <div className="relative">
            <select
              value={form.camera_id}
              onChange={(e) => setForm((f) => ({ ...f, camera_id: e.target.value }))}
              className="w-full appearance-none bg-zinc-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-white/20 pr-10"
            >
              <option value="">— select —</option>
              {cameras.map((c) => (
                <option key={c.id} value={c.id}>
                  {cameraLabel(c)}
                  {sortBy === "usage" && cameraCount[c.id] ? ` (${cameraCount[c.id]})` : ""}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">▾</span>
          </div>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Film</label>
          <div className="relative">
            <select
              value={form.film_id}
              onChange={(e) => setForm((f) => ({ ...f, film_id: e.target.value }))}
              className="w-full appearance-none bg-zinc-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-white/20 pr-10"
            >
              <option value="">— select —</option>
              {films.map((f) => (
                <option key={f.id} value={f.id}>
                  {filmLabel(f)}
                  {sortBy === "usage" && filmCount[f.id] ? ` (${filmCount[f.id]})` : ""}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">▾</span>
          </div>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Shot At</label>
          <input
            type="date"
            value={form.shot_at}
            onChange={(e) => setForm((f) => ({ ...f, shot_at: e.target.value }))}
            className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            placeholder="travel, street, portrait"
            className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={4}
            className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-white text-black py-4 rounded-xl font-semibold text-base active:scale-95 transition-transform disabled:opacity-50"
        >
          {saving ? "Creating…" : "Create Roll"}
        </button>
      </form>
    </div>
  );
}
