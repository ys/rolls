"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Camera } from "@/lib/db";
import { invalidateCache } from "@/lib/cache";
import PullToRefresh from "@/components/PullToRefresh";
import { SuccessMessage } from "@/components/SuccessCheckmark";
import { haptics } from "@/lib/haptics";
import BackButton from "@/components/BackButton";
import FormField from "@/components/FormField";
import FormButton from "@/components/FormButton";
import Sheet from "@/components/Sheet";

function cameraLabel(c: Camera): string {
  return c.nickname ?? `${c.brand} ${c.model}`;
}

export default function CamerasClient({ initialCameras }: { initialCameras: Camera[] }) {
  const router = useRouter();
  const [allCameras, setAllCameras] = useState(initialCameras);
  const [sortBy, setSortBy] = useState<"usage" | "alpha">("usage");
  const [form, setForm] = useState({ id: "", brand: "", model: "", nickname: "", format: "135" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
  const headers = (extra?: Record<string, string>): HeadersInit => ({
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    ...extra,
  });

  const cameras = sortBy === "alpha"
    ? [...allCameras].sort((a, b) => cameraLabel(a).localeCompare(cameraLabel(b)))
    : [...allCameras].sort((a, b) => (b.roll_count ?? 0) - (a.roll_count ?? 0));

  async function handleRefresh() {
    const resp = await fetch("/api/cameras", { headers: headers() });
    if (resp.ok) {
      const cameras = await resp.json();
      setAllCameras(cameras);
      router.refresh();
    }
  }

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
      haptics.error();
      return;
    }

    const camera = await resp.json();
    setAllCameras((prev) => [...prev.filter((c) => c.slug !== camera.slug), camera]);

    // Invalidate rolls cache since camera data changed
    invalidateCache("rolls");

    setForm({ id: "", brand: "", model: "", nickname: "", format: "135" });
    setSaving(false);
    setShowForm(false);
    setShowSuccess(true);
    haptics.success();

    // Hide success message after 2 seconds
    setTimeout(() => setShowSuccess(false), 2000);

    router.refresh();
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div>
        <BackButton label="Settings" />
        {showSuccess && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <SuccessMessage message="Camera saved!" />
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Cameras</h1>
          <div className="flex gap-1 text-xs bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => { setSortBy("usage"); haptics.light(); }}
              className={`px-2 py-1 rounded-md transition-colors ${sortBy === "usage" ? "bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white font-medium" : "text-zinc-500 dark:text-zinc-400"}`}
            >
              By usage
            </button>
            <button
              onClick={() => { setSortBy("alpha"); haptics.light(); }}
              className={`px-2 py-1 rounded-md transition-colors ${sortBy === "alpha" ? "bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white font-medium" : "text-zinc-500 dark:text-zinc-400"}`}
            >
              A–Z
            </button>
          </div>
        </div>

        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 mb-8">
          {cameras.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/cameras/${encodeURIComponent(c.slug)}`}
                onClick={() => haptics.light()}
                className="flex items-center justify-between px-4 py-3.5 active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors"
              >
                <div>
                  <div className="font-medium">{cameraLabel(c)}</div>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {c.slug} · {c.format}mm
                    {c.roll_count ? ` · ${c.roll_count} roll${c.roll_count === 1 ? "" : "s"}` : ""}
                  </div>
                </div>
                <svg className="w-4 h-4 text-zinc-300 dark:text-zinc-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
              </Link>
            </li>
          ))}
          {cameras.length === 0 && (
            <li className="text-zinc-500 text-sm text-center py-8">No cameras yet.</li>
          )}
        </ul>

        <button
          onClick={() => { setShowForm(true); setError(""); haptics.light(); }}
          className="w-full flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-3 mt-2 mb-3 text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <span>Add Camera</span>
          <span className="text-sm leading-none">+</span>
        </button>

        <Sheet open={showForm} onClose={() => { setShowForm(false); setError(""); }} title="Add Camera">
          <form onSubmit={async (e) => { await handleSubmit(e); }} className="space-y-6">
            <FormField label="ID (slug)" value={form.id} onChange={(v) => setForm((f) => ({ ...f, id: v }))} placeholder="leica-m6" required />
            <FormField label="Brand"    value={form.brand} onChange={(v) => setForm((f) => ({ ...f, brand: v }))} placeholder="Leica" required />
            <FormField label="Model"    value={form.model} onChange={(v) => setForm((f) => ({ ...f, model: v }))} placeholder="M6" required />
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
              {saving ? "Saving…" : "Add Camera"}
            </FormButton>
          </form>
        </Sheet>
      </div>
    </PullToRefresh>
  );
}
