"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import type { Camera } from "@/lib/db";

export default function EditCameraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [form, setForm] = useState({ brand: "", model: "", nickname: "", format: "135" });
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
    fetch(`/api/cameras/${encodeURIComponent(id)}`, { headers: headers() })
      .then((r) => r.json())
      .then((c: Camera) => {
        setForm({
          brand: c.brand ?? "",
          model: c.model ?? "",
          nickname: c.nickname ?? "",
          format: String(c.format ?? 135),
        });
        setLoading(false);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    const resp = await fetch(`/api/cameras/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({ ...form, format: parseInt(form.format, 10) }),
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
        <h1 className="text-2xl font-bold">Edit Camera</h1>
        <a href="/cameras" className="text-zinc-500 text-sm hover:text-zinc-900 dark:hover:text-white">← Cameras</a>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl px-4 py-2 mb-6 border border-zinc-100 dark:border-transparent">
        <p className="text-xs text-zinc-500 py-2">ID: <span className="font-mono text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">{id}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="Brand" value={form.brand} onChange={(v) => setForm((f) => ({ ...f, brand: v }))} placeholder="Leica" required />
        <Field label="Model" value={form.model} onChange={(v) => setForm((f) => ({ ...f, model: v }))} placeholder="M6" required />
        <Field label="Nickname" value={form.nickname} onChange={(v) => setForm((f) => ({ ...f, nickname: v }))} placeholder="(optional)" />
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 mb-1">Format</label>
          <div className="relative">
            <select
              value={form.format}
              onChange={(e) => setForm((f) => ({ ...f, format: e.target.value }))}
              className="w-full appearance-none bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20 pr-10"
            >
              <option value="135">135</option>
              <option value="120">120</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400">▾</span>
          </div>
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
