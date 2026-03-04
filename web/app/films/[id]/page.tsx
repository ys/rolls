"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import type { Film } from "@/lib/db";

export default function EditFilmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [form, setForm] = useState({ brand: "", name: "", nickname: "", iso: "", color: true, show_iso: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
  const headers = (extra?: Record<string, string>): HeadersInit => ({
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    ...extra,
  });

  useEffect(() => {
    fetch(`/api/films/${encodeURIComponent(id)}`, { headers: headers() })
      .then((r) => r.json())
      .then((f: Film) => {
        setForm({
          brand: f.brand ?? "",
          name: f.name ?? "",
          nickname: f.nickname ?? "",
          iso: f.iso ? String(f.iso) : "",
          color: f.color ?? true,
          show_iso: f.show_iso ?? false,
        });
        setLoading(false);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    const resp = await fetch(`/api/films/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({ ...form, iso: form.iso ? parseInt(form.iso, 10) : null }),
    });

    if (!resp.ok) {
      const data = await resp.json();
      setError(data.error ?? "Failed to save");
      setSaving(false);
      return;
    }

    setSaved(true);
    setSaving(false);
    router.refresh();
  }

  if (loading) return <div className="text-zinc-500 text-sm text-center py-16">Loading…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Film</h1>
        <a href="/films" className="text-zinc-500 text-sm hover:text-zinc-900 dark:hover:text-white">← Films</a>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl px-4 py-2 mb-6 border border-zinc-100 dark:border-transparent">
        <p className="text-xs text-zinc-500 py-2">ID: <span className="font-mono text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">{id}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="Brand"    value={form.brand}    onChange={(v) => setForm((f) => ({ ...f, brand: v }))}    placeholder="Kodak" required />
        <Field label="Name"     value={form.name}     onChange={(v) => setForm((f) => ({ ...f, name: v }))}     placeholder="Portra" required />
        <Field label="Nickname" value={form.nickname} onChange={(v) => setForm((f) => ({ ...f, nickname: v }))} placeholder="(optional)" />
        <Field label="ISO"      value={form.iso}      onChange={(v) => setForm((f) => ({ ...f, iso: v }))}      placeholder="400" />

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.color}
              onChange={(e) => setForm((f) => ({ ...f, color: e.target.checked }))}
              className="w-4 h-4"
            />
            Color
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.show_iso}
              onChange={(e) => setForm((f) => ({ ...f, show_iso: e.target.checked }))}
              className="w-4 h-4"
            />
            Show ISO in name
          </label>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black py-4 rounded-xl font-semibold active:scale-95 transition-transform disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </form>
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
      <label className="block text-sm text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 mb-1">{label}</label>
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
