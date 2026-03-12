"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Film } from "@/lib/db";
import { invalidateCache } from "@/lib/cache";
import PullToRefresh from "@/components/PullToRefresh";
import { SuccessMessage } from "@/components/SuccessCheckmark";
import { haptics } from "@/lib/haptics";
import BackButton from "@/components/BackButton";
import FormField from "@/components/FormField";
import FormButton from "@/components/FormButton";
import Sheet from "@/components/Sheet";

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
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
  const headers = (extra?: Record<string, string>): HeadersInit => ({
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    ...extra,
  });

  const films = sortBy === "alpha"
    ? [...allFilms].sort((a, b) => filmLabel(a).localeCompare(filmLabel(b)))
    : [...allFilms].sort((a, b) => (b.roll_count ?? 0) - (a.roll_count ?? 0));

  async function handleRefresh() {
    const resp = await fetch("/api/films", { headers: headers() });
    if (resp.ok) {
      const films = await resp.json();
      setAllFilms(films);
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

    const resp = await fetch("/api/films", {
      method: "POST",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({ ...form, iso: form.iso ? parseInt(form.iso, 10) : null }),
    });

    if (!resp.ok) {
      const data = await resp.json();
      setError(data.error ?? "Failed to create film");
      setSaving(false);
      haptics.error();
      return;
    }

    const film = await resp.json();
    setAllFilms((prev) => [...prev.filter((f) => f.slug !== film.slug), film]);

    // Invalidate rolls cache since film data changed
    invalidateCache("rolls");

    setForm({ id: "", brand: "", name: "", nickname: "", iso: "", color: true, show_iso: false });
    setSaving(false);
    setShowForm(false);
    showSuccessMsg("Film saved!");
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
      haptics.error();
      return;
    }

    const updated = await fetch("/api/films", { headers: headers() }).then((r) => r.json());
    setAllFilms(updated);

    // Invalidate rolls cache since film data changed
    invalidateCache("rolls");

    setSelected(new Set());
    setTargetId("");
    setMerging(false);
    setMergeSaving(false);
    showSuccessMsg(`Films merged into ${targetId}!`);
    router.refresh();
  }

  const selectedFilms = allFilms.filter((f) => selected.has(f.slug));

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div>
        <BackButton label="Settings" />
        {showSuccess && (
          <div className="mb-4 p-3" style={{ backgroundColor: "var(--darkroom-success-bg)" }}>
            <SuccessMessage message={successMessage} />
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--darkroom-text-primary)" }}>FILMS</h1>
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
              className="text-xs font-medium px-3 py-1.5 transition-colors" style={{ color: "var(--darkroom-text-secondary)", backgroundColor: "transparent", border: "1px solid var(--darkroom-border)" }}
            >
              {merging ? "Cancel" : "Merge"}
            </button>
          </div>
        </div>

        <ul className={merging ? "space-y-2 mb-4" : "space-y-2 mb-8"}>
          {films.map((f) => {
            const displayName = filmLabel(f);
            const meta = `${f.slug} · ${f.color ? "color" : "b&w"}${f.iso ? ` · ISO ${f.iso}` : ""}${f.roll_count ? ` · ${f.roll_count} roll${f.roll_count === 1 ? "" : "s"}` : ""}`;

            if (merging) {
              const isSelected = selected.has(f.slug);
              return (
                <li key={f.slug}>
                  <button
                    onClick={() => { toggleSelect(f.slug); haptics.light(); }}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b transition-colors ${isSelected ? "border-amber-400" : "border-zinc-600"}`} style={{ borderColor: isSelected ? "var(--darkroom-accent)" : "var(--darkroom-border)" }}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${isSelected ? "bg-amber-400 border-amber-400" : "border-zinc-600"}`}>
                      {isSelected && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <div>
                      <div className="font-medium">{displayName}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">{meta}</div>
                    </div>
                  </button>
                </li>
              );
            }

            return (
              <li key={f.slug}>
                <Link
                  href={`/films/${encodeURIComponent(f.slug)}`}
                  onClick={() => haptics.light()}
                  className="flex items-center justify-between px-4 py-3.5 border-b active:bg-zinc-900/30 transition-colors" style={{ borderColor: "var(--darkroom-border)" }}
                >
                  <div>
                    <div className="font-medium">{displayName}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{meta}</div>
                  </div>
                  <svg className="w-4 h-4 text-zinc-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                </Link>
              </li>
            );
          })}
          {films.length === 0 && (
            <li className="flex flex-col items-center justify-center py-12 gap-2 text-center">
              <svg className="w-10 h-10 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125a1.125 1.125 0 00-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125m0 3.75v-3.75M6 18.375V7.875c0-.621.504-1.125 1.125-1.125h9.75c.621 0 1.125.504 1.125 1.125v10.5c0 .621-.504 1.125-1.125 1.125M6 18.375H3.375m14.25 0H18.75M18.75 19.5h-1.5c-.621 0-1.125-.504-1.125-1.125M18.75 19.5a1.125 1.125 0 001.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75v-3.75" />
              </svg>
              <p className="text-xs" style={{ color: "var(--darkroom-text-tertiary)" }}>No films yet.<br />Add your first film to get started.</p>
            </li>
          )}
        </ul>

        {/* Merge panel */}
        {merging && selected.size >= 2 && (
          <div className="mb-6 space-y-4 border-t pt-4" style={{ borderColor: "var(--darkroom-border)" }}>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400">{selected.size} films selected — keep which one?</p>
            <div className="space-y-2">
              {selectedFilms.map((f) => (
                <label key={f.slug} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="target"
                    value={f.slug}
                    checked={targetId === f.slug}
                    onChange={() => setTargetId(f.slug)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">
                    {filmLabel(f)}
                    <span className="text-zinc-500 ml-1">({f.slug})</span>
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
              className="w-full flex items-center justify-between border-t pt-3 mt-2 mb-3 text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white transition-colors" style={{ borderColor: "var(--darkroom-border)" }}
            >
              <span>Add Film</span>
              <span className="text-sm leading-none">+</span>
            </button>

            <Sheet open={showForm} onClose={() => { setShowForm(false); setError(""); }} title="Add Film">
              <form onSubmit={handleSubmit} className="space-y-6">
                <FormField label="ID (slug)" value={form.id}       onChange={(v) => setForm((f) => ({ ...f, id: v }))}       placeholder="portra-400" required />
                <FormField label="Brand"     value={form.brand}    onChange={(v) => setForm((f) => ({ ...f, brand: v }))}    placeholder="Kodak" required />
                <FormField label="Name"      value={form.name}     onChange={(v) => setForm((f) => ({ ...f, name: v }))}     placeholder="Portra" required />
                <FormField label="Nickname"  value={form.nickname} onChange={(v) => setForm((f) => ({ ...f, nickname: v }))} placeholder="optional" />
                <FormField label="ISO"       value={form.iso}      onChange={(v) => setForm((f) => ({ ...f, iso: v }))}      placeholder="400" inputMode="numeric" />

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-400">
                    <input type="checkbox" checked={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.checked }))} className="w-4 h-4" />
                    Color
                  </label>
                  <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-400">
                    <input type="checkbox" checked={form.show_iso} onChange={(e) => setForm((f) => ({ ...f, show_iso: e.target.checked }))} className="w-4 h-4" />
                    Show ISO in name
                  </label>
                </div>

                {error && <p className="text-red-400 text-xs tracking-wide">{error}</p>}
                <FormButton type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Add Film"}
                </FormButton>
              </form>
            </Sheet>
          </>
        )}
      </div>
    </PullToRefresh>
  );
}
