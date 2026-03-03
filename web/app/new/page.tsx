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

export default function NewRollPage() {
  const router = useRouter();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [films, setFilms] = useState<Film[]>([]);
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
    ]).then(([cams, fils, rols]) => {
      setCameras(cams);
      setFilms(fils);
      const suggested = nextRollNumber(rols);
      setSuggestedNumber(suggested);
      setForm((f) => ({ ...f, roll_number: suggested }));
    });
  }, []);

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
      <h1 className="text-2xl font-bold mb-6">New Roll</h1>
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
          <select
            value={form.camera_id}
            onChange={(e) => setForm((f) => ({ ...f, camera_id: e.target.value }))}
            className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <option value="">— select —</option>
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nickname ?? `${c.brand} ${c.model}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Film</label>
          <select
            value={form.film_id}
            onChange={(e) => setForm((f) => ({ ...f, film_id: e.target.value }))}
            className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <option value="">— select —</option>
            {films.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nickname ?? `${f.brand} ${f.name}${f.show_iso && f.iso ? ` ${f.iso}` : ""}`}
              </option>
            ))}
          </select>
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
