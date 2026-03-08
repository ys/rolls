"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import type { Camera } from "@/lib/db";
import BackButton from "@/components/BackButton";
import FormField from "@/components/FormField";
import FormButton from "@/components/FormButton";

export default function EditCameraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [form, setForm] = useState({ brand: "", model: "", nickname: "", format: "135" });
  const [rollCount, setRollCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
  const headers = (extra?: Record<string, string>): HeadersInit => ({
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    ...extra,
  });

  useEffect(() => {
    fetch(`/api/cameras/${encodeURIComponent(id)}`, { headers: headers() })
      .then((r) => r.json())
      .then((c: Camera & { roll_count: number }) => {
        setForm({
          brand: c.brand ?? "",
          model: c.model ?? "",
          nickname: c.nickname ?? "",
          format: String(c.format ?? 135),
        });
        setRollCount(c.roll_count ?? 0);
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

  async function handleDelete() {
    if (!confirm("Delete this camera? This cannot be undone.")) return;
    setDeleting(true);
    setError("");
    const resp = await fetch(`/api/cameras/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: headers(),
    });
    if (resp.ok) {
      router.push("/cameras");
    } else {
      const data = await resp.json();
      setError(data.error ?? "Failed to delete");
      setDeleting(false);
    }
  }

  if (loading) return <div className="text-zinc-500 text-sm text-center py-16">Loading…</div>;

  return (
    <div>
      <BackButton label="Cameras" />
      <h1 className="text-2xl font-bold mb-6">Edit Camera</h1>

      <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-6">
        ID: <span className="font-mono normal-case">{id}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Brand" value={form.brand} onChange={(v) => setForm((f) => ({ ...f, brand: v }))} placeholder="Leica" required />
        <FormField label="Model" value={form.model} onChange={(v) => setForm((f) => ({ ...f, model: v }))} placeholder="M6" required />
        <FormField label="Nickname" value={form.nickname} onChange={(v) => setForm((f) => ({ ...f, nickname: v }))} placeholder="optional" />

        <div className="space-y-1">
          <label className="block text-[10px] uppercase tracking-widest text-zinc-400">Format</label>
          <div className="relative">
            <select
              value={form.format}
              onChange={(e) => setForm((f) => ({ ...f, format: e.target.value }))}
              className="w-full appearance-none rounded-none bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white py-2 text-base focus:outline-none transition-colors pr-6"
            >
              <option value="135">135</option>
              <option value="120">120</option>
            </select>
            <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400">▾</span>
          </div>
        </div>

        {error && <p className="text-red-400 text-xs tracking-wide">{error}</p>}
        <FormButton type="submit" disabled={saving}>
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
        </FormButton>
      </form>

      {rollCount === 0 && (
        <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <FormButton variant="secondary" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete Camera"}
          </FormButton>
        </div>
      )}
    </div>
  );
}
