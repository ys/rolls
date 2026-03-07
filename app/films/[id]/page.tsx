"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import type { Film } from "@/lib/db";
import BackButton from "@/components/BackButton";
import FormField from "@/components/FormField";
import FormButton from "@/components/FormButton";

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
      <BackButton label="Films" />
      <h1 className="text-2xl font-bold mb-6">Edit Film</h1>

      <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-6">
        ID: <span className="font-mono normal-case">{id}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Brand"    value={form.brand}    onChange={(v) => setForm((f) => ({ ...f, brand: v }))}    placeholder="Kodak" required />
        <FormField label="Name"     value={form.name}     onChange={(v) => setForm((f) => ({ ...f, name: v }))}     placeholder="Portra" required />
        <FormField label="Nickname" value={form.nickname} onChange={(v) => setForm((f) => ({ ...f, nickname: v }))} placeholder="optional" />
        <FormField label="ISO"      value={form.iso}      onChange={(v) => setForm((f) => ({ ...f, iso: v }))}      placeholder="400" inputMode="numeric" />

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-400">
            <input
              type="checkbox"
              checked={form.color}
              onChange={(e) => setForm((f) => ({ ...f, color: e.target.checked }))}
              className="w-4 h-4"
            />
            Color
          </label>
          <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-400">
            <input
              type="checkbox"
              checked={form.show_iso}
              onChange={(e) => setForm((f) => ({ ...f, show_iso: e.target.checked }))}
              className="w-4 h-4"
            />
            Show ISO in name
          </label>
        </div>

        {error && <p className="text-red-400 text-xs tracking-wide">{error}</p>}
        <FormButton type="submit" disabled={saving}>
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
        </FormButton>
      </form>
    </div>
  );
}
