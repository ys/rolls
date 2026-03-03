"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Camera } from "@/lib/db";

export default function CamerasPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [form, setForm] = useState({ id: "", brand: "", model: "", nickname: "", format: "135" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
  const headers = (extra?: Record<string, string>): HeadersInit => ({
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    ...extra,
  });

  useEffect(() => {
    fetch("/api/cameras", { headers: headers() })
      .then((r) => r.json())
      .then(setCameras);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const resp = await fetch("/api/cameras", {
      method: "POST",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({ ...form, format: parseInt(form.format, 10) }),
    });

    if (!resp.ok) {
      const data = await resp.json();
      setError(data.error ?? "Failed to create camera");
      setSaving(false);
      return;
    }

    const camera = await resp.json();
    setCameras((prev) => [...prev.filter((c) => c.id !== camera.id), camera].sort((a, b) => a.id.localeCompare(b.id)));
    setForm({ id: "", brand: "", model: "", nickname: "", format: "135" });
    setSaving(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Cameras</h1>

      <ul className="space-y-2 mb-8">
        {cameras.map((c) => (
          <li key={c.id}>
            <Link
              href={`/cameras/${encodeURIComponent(c.id)}`}
              className="flex items-center justify-between bg-zinc-900 rounded-xl px-4 py-3 hover:bg-zinc-800 transition-colors"
            >
              <div>
                <div className="font-medium">{c.nickname ?? `${c.brand} ${c.model}`}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{c.id} · {c.format}mm</div>
              </div>
              <span className="text-xs text-zinc-600">Edit →</span>
            </Link>
          </li>
        ))}
        {cameras.length === 0 && (
          <li className="text-zinc-500 text-sm text-center py-8">No cameras yet.</li>
        )}
      </ul>

      <h2 className="text-lg font-semibold mb-4">Add Camera</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="ID (slug)" value={form.id} onChange={(v) => setForm((f) => ({ ...f, id: v }))} placeholder="leica-m6" required />
        <Field label="Brand"    value={form.brand} onChange={(v) => setForm((f) => ({ ...f, brand: v }))} placeholder="Leica" required />
        <Field label="Model"    value={form.model} onChange={(v) => setForm((f) => ({ ...f, model: v }))} placeholder="M6" required />
        <Field label="Nickname" value={form.nickname} onChange={(v) => setForm((f) => ({ ...f, nickname: v }))} placeholder="(optional)" />
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Format</label>
          <select
            value={form.format}
            onChange={(e) => setForm((f) => ({ ...f, format: e.target.value }))}
            className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-base focus:outline-none"
          >
            <option value="135">135</option>
            <option value="120">120</option>
          </select>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-white text-black py-4 rounded-xl font-semibold active:scale-95 transition-transform disabled:opacity-50"
        >
          {saving ? "Saving…" : "Add Camera"}
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
      <label className="block text-sm text-zinc-400 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-white/20"
      />
    </div>
  );
}
