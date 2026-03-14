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
  const [successMessage, setSuccessMessage] = useState("");

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

  function showSuccessMsg(msg: string) {
    setSuccessMessage(msg);
    setShowSuccess(true);
    haptics.success();
    setTimeout(() => setShowSuccess(false), 2000);
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

    invalidateCache("rolls");

    setForm({ id: "", brand: "", model: "", nickname: "", format: "135" });
    setSaving(false);
    setShowForm(false);
    showSuccessMsg("Camera saved!");

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
    const resp = await fetch("/api/cameras/merge", {
      method: "POST",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({ target_id: targetId, source_ids }),
    });

    if (!resp.ok) {
      const data = await resp.json();
      setMergeError(data.error ?? "Merge failed");
      setMergeSaving(false);
      haptics.error();
      return;
    }

    const updated = await fetch("/api/cameras", { headers: headers() }).then((r) => r.json());
    setAllCameras(updated);

    invalidateCache("rolls");

    setSelected(new Set());
    setTargetId("");
    setMerging(false);
    setMergeSaving(false);
    showSuccessMsg(`Cameras merged into ${targetId}!`);
    router.refresh();
  }

  const selectedCameras = allCameras.filter((c) => selected.has(c.slug));

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div>
        <BackButton label="Settings" />
        {showSuccess && (
          <div className="mb-4 p-3" style={{ backgroundColor: "rgba(34, 197, 94, 0.15)" }}>
            <SuccessMessage message={successMessage} />
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>CAMERAS</h1>
          <div className="flex gap-2 items-center">
            {!merging && (
              <div className="flex gap-1 text-xs p-1">
                <button
                  onClick={() => { setSortBy("usage"); haptics.light(); }}
                  className={`px-2 py-1 transition-colors ${sortBy === "usage" ? "text-amber-400 font-medium" : "text-zinc-600"}`}
                >
                  By usage
                </button>
                <button
                  onClick={() => { setSortBy("alpha"); haptics.light(); }}
                  className={`px-2 py-1 transition-colors ${sortBy === "alpha" ? "text-amber-400 font-medium" : "text-zinc-600"}`}
                >
                  A–Z
                </button>
              </div>
            )}
            <button
              onClick={() => { setMerging((m) => !m); setSelected(new Set()); setTargetId(""); setMergeError(""); haptics.light(); }}
              className="text-xs font-medium px-3 py-1.5 transition-colors" style={{ color: "var(--text-secondary)", backgroundColor: "transparent", border: "1px solid var(--border)" }}
            >
              {merging ? "Cancel" : "Merge"}
            </button>
          </div>
        </div>

        <ul className={merging ? "space-y-2 mb-4" : "space-y-2 mb-8"}>
          {cameras.map((c) => {
            if (merging) {
              const isSelected = selected.has(c.slug);
              return (
                <li key={c.slug}>
                  <button
                    onClick={() => { toggleSelect(c.slug); haptics.light(); }}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b transition-colors ${isSelected ? "border-amber-400" : "border-zinc-600"}`} style={{ borderColor: isSelected ? "var(--accent)" : "var(--border)" }}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${isSelected ? "bg-amber-400 border-amber-400" : "border-zinc-600"}`}>
                      {isSelected && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <div>
                      <div className="font-medium">{cameraLabel(c)}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {c.slug} · {c.format}mm{c.roll_count ? ` · ${c.roll_count} roll${c.roll_count === 1 ? "" : "s"}` : ""}
                      </div>
                    </div>
                  </button>
                </li>
              );
            }

            return (
              <li key={c.slug}>
                <Link
                  href={`/cameras/${encodeURIComponent(c.slug)}`}
                  onClick={() => haptics.light()}
                  className="flex items-center justify-between px-4 py-3.5 border-b active:bg-zinc-900/30 transition-colors" style={{ borderColor: "var(--border)" }}
                >
                  <div>
                    <div className="font-medium">{cameraLabel(c)}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      {c.slug} · {c.format}mm
                      {c.roll_count ? ` · ${c.roll_count} roll${c.roll_count === 1 ? "" : "s"}` : ""}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-zinc-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                </Link>
              </li>
            );
          })}
          {cameras.length === 0 && (
            <li className="flex flex-col items-center justify-center py-12 gap-2 text-center">
              <svg className="w-10 h-10 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>No cameras yet.<br />Add your first camera to get started.</p>
            </li>
          )}
        </ul>

        {/* Merge panel */}
        {merging && selected.size >= 2 && (
          <div className="mb-6 space-y-4 border-t pt-4" style={{ borderColor: "var(--border)" }}>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400">{selected.size} cameras selected — keep which one?</p>
            <div className="space-y-2">
              {selectedCameras.map((c) => (
                <label key={c.slug} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="target"
                    value={c.slug}
                    checked={targetId === c.slug}
                    onChange={() => setTargetId(c.slug)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">
                    {cameraLabel(c)}
                    <span className="text-zinc-500 ml-1">({c.slug})</span>
                  </span>
                </label>
              ))}
            </div>
            {mergeError && <p className="text-red-400 text-xs tracking-wide">{mergeError}</p>}
            <button
              onClick={handleMerge}
              disabled={!targetId || mergeSaving}
              className="w-full border border-red-600 text-red-600 py-3 text-xs tracking-widest uppercase font-medium hover:bg-red-600 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {mergeSaving ? "Merging…" : `Merge ${selected.size - 1} into ${targetId || "…"}`}
            </button>
          </div>
        )}

        {!merging && (
          <>
            <button
              onClick={() => { setShowForm(true); setError(""); haptics.light(); }}
              className="w-full flex items-center justify-between border-t pt-3 mt-2 mb-3 text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white transition-colors" style={{ borderColor: "var(--border)" }}
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
                      className="w-full appearance-none rounded-none bg-transparent border-b focus:border-white py-2 text-base focus:outline-none transition-colors pr-6"
                    >
                      <option value="135">135</option>
                      <option value="120">120</option>
                    </select>
                    <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-zinc-400">▾</span>
                  </div>
                </div>
                {error && <p className="text-red-400 text-xs tracking-wide">{error}</p>}
                <FormButton type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Add Camera"}
                </FormButton>
              </form>
            </Sheet>
          </>
        )}
      </div>
    </PullToRefresh>
  );
}
