"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Film } from "@/lib/db";

function filmLabel(f: Film): string {
  if (f.nickname) return f.nickname;
  const iso = f.show_iso && f.iso ? ` ${f.iso}` : "";
  return `${f.brand} ${f.name}${iso}`;
}

export default function FilmsClient({ initialFilms }: { initialFilms: Film[] }) {
  const router = useRouter();
  const [allFilms, setAllFilms] = useState(initialFilms);
  const [sortBy, setSortBy] = useState<"usage" | "alpha">("usage");
  const [form, setForm] = useState({
    id: "", brand: "", name: "", nickname: "", iso: "", color: true, show_iso: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Merge mode state
  const [merging, setMerging] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [targetId, setTargetId] = useState("");
  const [mergeError, setMergeError] = useState("");
  const [mergeSaving, setMergeSaving] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
  const headers = (extra?: Record<string, string>): HeadersInit => ({
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    ...extra,
  });

  const films = sortBy === "alpha"
    ? [...allFilms].sort((a, b) => filmLabel(a).localeCompare(filmLabel(b)))
    : [...allFilms].sort((a, b) => (b.roll_count ?? 0) - (a.roll_count ?? 0));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const resp = await fetch("/api/films", {
      method: "POST",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({ ...form, iso: form.iso ? parseInt(form.iso, 10) : null }),
    });

    if (!resp.ok) {
      const data = await resp.json();
      setError(data.error ?? "Failed to create film");
      setSaving(false);
      return;
    }

    const film = await resp.json();
    setAllFilms((prev) => [...prev.filter((f) => f.id !== film.id), film]);
    setForm({ id: "", brand: "", name: "", nickname: "", iso: "", color: true, show_iso: false });
    setSaving(false);
    setShowForm(false);
    router.refresh();
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleMerge() {
    if (!targetId || selected.size < 2) return;
    setMergeSaving(true);
    setMergeError("");

    const source_ids = [...selected].filter((id) => id !== targetId);
    const resp = await fetch("/api/films/merge", {
      method: "POST",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({ target_id: targetId, source_ids }),
    });

    if (!resp.ok) {
      const data = await resp.json();
      setMergeError(data.error ?? "Merge failed");
      setMergeSaving(false);
      return;
    }

    const updated = await fetch("/api/films", { headers: headers() }).then((r) => r.json());
    setAllFilms(updated);
    setSelected(new Set());
    setTargetId("");
    setMerging(false);
    setMergeSaving(false);
    router.refresh();
  }

  const selectedFilms = allFilms.filter((f) => selected.has(f.id));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Films</h1>
        <div className="flex gap-2 items-center">
          {!merging && (
            <div className="flex gap-1 text-xs bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
              <button
                onClick={() => setSortBy("usage")}
                className={`px-2 py-1 rounded-md transition-colors ${sortBy === "usage" ? "bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white font-medium" : "text-zinc-500 dark:text-zinc-400"}`}
              >
                By usage
              </button>
              <button
                onClick={() => setSortBy("alpha")}
                className={`px-2 py-1 rounded-md transition-colors ${sortBy === "alpha" ? "bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white font-medium" : "text-zinc-500 dark:text-zinc-400"}`}
              >
                A–Z
              </button>
            </div>
          )}
          <button
            onClick={() => { setMerging((m) => !m); setSelected(new Set()); setTargetId(""); setMergeError(""); }}
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${merging ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"}`}
          >
            {merging ? "Cancel" : "Merge"}
          </button>
        </div>
      </div>

      <ul className="space-y-2 mb-4">
        {films.map((f) => {
          const displayName = filmLabel(f);
          const meta = `${f.id} · ${f.color ? "color" : "b&w"}${f.iso ? ` · ISO ${f.iso}` : ""}${f.roll_count ? ` · ${f.roll_count} roll${f.roll_count === 1 ? "" : "s"}` : ""}`;

          if (merging) {
            const isSelected = selected.has(f.id);
            return (
              <li key={f.id}>
                <button
                  onClick={() => toggleSelect(f.id)}
                  className={`w-full text-left flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${isSelected ? "bg-blue-100 dark:bg-blue-900/50 ring-1 ring-blue-500" : "bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${isSelected ? "bg-blue-500 border-blue-500" : "border-zinc-400 dark:border-zinc-600"}`}>
                    {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <div>
                    <div className="font-medium">{displayName}</div>
                    <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{meta}</div>
                  </div>
                </button>
              </li>
            );
          }

          return (
            <li key={f.id}>
              <Link
                href={`/films/${encodeURIComponent(f.id)}`}
                className="flex items-center justify-between bg-white dark:bg-zinc-900 rounded-xl px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div>
                  <div className="font-medium">{displayName}</div>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{meta}</div>
                </div>
                <span className="text-xs text-zinc-400 dark:text-zinc-600">Edit →</span>
              </Link>
            </li>
          );
        })}
        {films.length === 0 && (
          <li className="text-zinc-500 text-sm text-center py-8">No films yet.</li>
        )}
      </ul>

      {/* Merge panel */}
      {merging && selected.size >= 2 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 mb-6 space-y-3 border border-zinc-200 dark:border-transparent">
          <p className="text-sm font-medium">{selected.size} films selected — keep which one?</p>
          <div className="space-y-2">
            {selectedFilms.map((f) => (
              <label key={f.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="target"
                  value={f.id}
                  checked={targetId === f.id}
                  onChange={() => setTargetId(f.id)}
                  className="w-4 h-4 accent-white"
                />
                <span className="text-sm">
                  {filmLabel(f)}
                  <span className="text-zinc-500 ml-1">({f.id})</span>
                </span>
              </label>
            ))}
          </div>
          {mergeError && <p className="text-red-400 text-sm">{mergeError}</p>}
          <button
            onClick={handleMerge}
            disabled={!targetId || mergeSaving}
            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 py-3 rounded-xl text-sm font-semibold transition-colors text-white"
          >
            {mergeSaving ? "Merging…" : `Merge ${selected.size - 1} into ${targetId || "…"}`}
          </button>
        </div>
      )}

      {!merging && (
        <>
          <button
            onClick={() => { setShowForm((v) => !v); setError(""); }}
            className="w-full flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl px-4 py-3 text-sm font-medium transition-colors mb-3"
          >
            <span>Add Film</span>
            <span className="text-zinc-500 dark:text-zinc-400 text-lg leading-none">{showForm ? "−" : "+"}</span>
          </button>
          {!showForm ? null : <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="ID (slug)" value={form.id}       onChange={(v) => setForm((f) => ({ ...f, id: v }))}       placeholder="portra-400" required />
            <Field label="Brand"     value={form.brand}    onChange={(v) => setForm((f) => ({ ...f, brand: v }))}    placeholder="Kodak" required />
            <Field label="Name"      value={form.name}     onChange={(v) => setForm((f) => ({ ...f, name: v }))}     placeholder="Portra" required />
            <Field label="Nickname"  value={form.nickname} onChange={(v) => setForm((f) => ({ ...f, nickname: v }))} placeholder="(optional)" />
            <Field label="ISO"       value={form.iso}      onChange={(v) => setForm((f) => ({ ...f, iso: v }))}      placeholder="400" />

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.checked }))} className="w-4 h-4" />
                Color
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.show_iso} onChange={(e) => setForm((f) => ({ ...f, show_iso: e.target.checked }))} className="w-4 h-4" />
                Show ISO in name
              </label>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={saving} className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black py-4 rounded-xl font-semibold active:scale-95 transition-transform disabled:opacity-50">
              {saving ? "Saving…" : "Add Film"}
            </button>
          </form>}
        </>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20"
      />
    </div>
  );
}
