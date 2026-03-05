"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Camera, Film } from "@/lib/db";

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

  useEffect(() => {
    import("@github/markdown-toolbar-element");
  }, []);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
    const headers: HeadersInit = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};

    Promise.all([
      fetch("/api/cameras", { headers }).then((r) => r.json()),
      fetch("/api/films", { headers }).then((r) => r.json()),
      fetch("/api/rolls/next", { headers }).then((r) => r.json()),
    ]).then(([cams, fils, next]: [Camera[], Film[], { roll_number: string }]) => {
      setAllCameras(cams);
      setAllFilms(fils);
      setSuggestedNumber(next.roll_number);
      setForm((f) => ({ ...f, roll_number: next.roll_number }));
    });
  }, []);

  const cameras = [...allCameras].sort((a, b) => (b.roll_count ?? 0) - (a.roll_count ?? 0));
  const films = [...allFilms].sort((a, b) => (b.roll_count ?? 0) - (a.roll_count ?? 0));

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
            className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20"
          />
        </div>

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
                <option key={c.id} value={c.id}>{cameraLabel(c)}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400">▾</span>
          </div>
        </div>

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
                <option key={f.id} value={f.id}>{filmLabel(f)}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400">▾</span>
          </div>
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
