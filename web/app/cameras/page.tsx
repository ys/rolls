"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Camera } from "@/lib/db";

function cameraLabel(c: Camera): string {
  return c.nickname ?? `${c.brand} ${c.model}`;
}

export default function CamerasPage() {
  const [allCameras, setAllCameras] = useState<Camera[]>([]);
  const [sortBy, setSortBy] = useState<"usage" | "alpha">("usage");
  const [form, setForm] = useState({ id: "", brand: "", model: "", nickname: "", format: "135" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
  const headers = (extra?: Record<string, string>): HeadersInit => ({
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    ...extra,
  });

  useEffect(() => {
    fetch("/api/cameras", { headers: headers() })
      .then((r) => r.json())
      .then((data) => { setAllCameras(data); setLoading(false); });
  }, []);

  const cameras = sortBy === "alpha"
    ? [...allCameras].sort((a, b) => cameraLabel(a).localeCompare(cameraLabel(b)))
    : [...allCameras].sort((a, b) => (b.roll_count ?? 0) - (a.roll_count ?? 0));

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
    setAllCameras((prev) => [...prev.filter((c) => c.id !== camera.id), camera]);
    setForm({ id: "", brand: "", model: "", nickname: "", format: "135" });
    setSaving(false);
    setShowForm(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Cameras</h1>
        <div className="flex gap-1 text-xs bg-zinc-800 rounded-lg p-1">
          <button
            onClick={() => setSortBy("usage")}
            className={`px-2 py-1 rounded-md transition-colors ${sortBy === "usage" ? "bg-white text-black font-medium" : "text-zinc-400"}`}
          >
            By usage
          </button>
          <button
            onClick={() => setSortBy("alpha")}
            className={`px-2 py-1 rounded-md transition-colors ${sortBy === "alpha" ? "bg-white text-black font-medium" : "text-zinc-400"}`}
          >
            A–Z
          </button>
        </div>
      </div>

      <ul className="space-y-2 mb-8">
        {cameras.map((c) => (
          <li key={c.id}>
            <Link
              href={`/cameras/${encodeURIComponent(c.id)}`}
              prefetch={false}
              className="flex items-center justify-between bg-zinc-900 rounded-xl px-4 py-3 hover:bg-zinc-800 transition-colors"
            >
              <div>
                <div className="font-medium">{cameraLabel(c)}</div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {c.id} · {c.format}mm
                  {c.roll_count ? ` · ${c.roll_count} roll${c.roll_count === 1 ? "" : "s"}` : ""}
                </div>
              </div>
              <span className="text-xs text-zinc-600">Edit →</span>
            </Link>
          </li>
        ))}
        {loading && (
          Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse" />
          ))
        )}
        {!loading && cameras.length === 0 && (
          <li className="text-zinc-500 text-sm text-center py-8">No cameras yet.</li>
        )}
      </ul>

      <button
        onClick={() => { setShowForm((v) => !v); setError(""); }}
        className="w-full flex items-center justify-between bg-zinc-800 hover:bg-zinc-700 rounded-xl px-4 py-3 text-sm font-medium transition-colors mb-3"
      >
        <span>Add Camera</span>
        <span className="text-zinc-400 text-lg leading-none">{showForm ? "−" : "+"}</span>
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="ID (slug)" value={form.id} onChange={(v) => setForm((f) => ({ ...f, id: v }))} placeholder="leica-m6" required />
          <Field label="Brand"    value={form.brand} onChange={(v) => setForm((f) => ({ ...f, brand: v }))} placeholder="Leica" required />
          <Field label="Model"    value={form.model} onChange={(v) => setForm((f) => ({ ...f, model: v }))} placeholder="M6" required />
          <Field label="Nickname" value={form.nickname} onChange={(v) => setForm((f) => ({ ...f, nickname: v }))} placeholder="(optional)" />
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Format</label>
            <div className="relative">
              <select
                value={form.format}
                onChange={(e) => setForm((f) => ({ ...f, format: e.target.value }))}
                className="w-full appearance-none bg-zinc-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-white/20 pr-10"
              >
                <option value="135">135</option>
                <option value="120">120</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">▾</span>
            </div>
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
