"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Film } from "@/lib/db";
import { invalidateCache } from "@/lib/cache";
import PullToRefresh from "@/components/PullToRefresh";
import BackButton from "@/components/BackButton";
import FormField from "@/components/FormField";
import FormButton from "@/components/FormButton";
import Sheet from "@/components/Sheet";
import { haptics } from "@/lib/haptics";

function filmLabel(f: Film): string {
  if (f.nickname) return f.nickname;
  const iso = f.show_iso && f.iso ? ` ${f.iso}` : "";
  return `${f.brand} ${f.name}${iso}`;
}

function filmSub(f: Film): string {
  const parts: string[] = [];
  if (f.iso) parts.push(`ISO ${f.iso}`);
  parts.push(f.slide ? "Slide" : f.color ? "Colour" : "B&W");
  if (f.roll_count) parts.push(`${f.roll_count} roll${f.roll_count === 1 ? "" : "s"}`);
  return parts.join(" · ");
}

const tab = (active: boolean): React.CSSProperties => ({
  fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
  background: "none", border: "none",
  borderBottom: active ? "1.5px solid var(--accent)" : "1.5px solid transparent",
  color: active ? "var(--accent)" : "var(--text-tertiary)",
  paddingBottom: 2, fontFamily: "inherit", cursor: "pointer",
});

export default function FilmsClient({ initialFilms }: { initialFilms: Film[] }) {
  const router = useRouter();
  const [allFilms, setAllFilms] = useState(initialFilms);
  const [sortBy, setSortBy] = useState<"usage" | "alpha">("usage");
  const [form, setForm] = useState({ id: "", brand: "", name: "", nickname: "", iso: "", color: true, slide: false, show_iso: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
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

  async function handleRefresh() {
    const resp = await fetch("/api/films", { headers: headers() });
    if (resp.ok) { setAllFilms(await resp.json()); router.refresh(); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    const resp = await fetch("/api/films", {
      method: "POST",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({ ...form, iso: form.iso ? parseInt(form.iso, 10) : null }),
    });
    if (!resp.ok) {
      const data = await resp.json();
      setError(data.error ?? "Failed to create film");
      setSaving(false); haptics.error(); return;
    }
    const film = await resp.json();
    setAllFilms((prev) => [...prev.filter((f) => f.slug !== film.slug), film]);
    invalidateCache("rolls");
    setForm({ id: "", brand: "", name: "", nickname: "", iso: "", color: true, slide: false, show_iso: false });
    setSaving(false); setShowForm(false); haptics.success();
    router.refresh();
  }

  function toggleSelect(id: string) {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  async function handleMerge() {
    if (!targetId || selected.size < 2) return;
    setMergeSaving(true); setMergeError("");
    const source_ids = [...selected].filter((id) => id !== targetId);
    const resp = await fetch("/api/films/merge", {
      method: "POST",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({ target_id: targetId, source_ids }),
    });
    if (!resp.ok) {
      const data = await resp.json();
      setMergeError(data.error ?? "Merge failed");
      setMergeSaving(false); haptics.error(); return;
    }
    const updated = await fetch("/api/films", { headers: headers() }).then((r) => r.json());
    setAllFilms(updated);
    invalidateCache("rolls");
    setSelected(new Set()); setTargetId(""); setMerging(false); setMergeSaving(false);
    haptics.success(); router.refresh();
  }

  const selectedFilms = allFilms.filter((f) => selected.has(f.slug));

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div style={{ paddingBottom: 80 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px", borderBottom: "1px solid var(--border)" }}>
          <BackButton label="···" />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-primary)" }}>Films</span>
          <button
            onClick={() => { setMerging((m) => !m); setSelected(new Set()); setTargetId(""); setMergeError(""); haptics.light(); }}
            style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-tertiary)", background: "none", border: "1px solid var(--border)", padding: "4px 8px", cursor: "pointer", fontFamily: "inherit" }}
          >
            {merging ? "Done" : "Merge"}
          </button>
        </div>

        {/* Sort tabs */}
        {!merging && (
          <div style={{ display: "flex", gap: 16, padding: "10px 20px", borderBottom: "1px solid var(--border)" }}>
            <button style={tab(sortBy === "usage")} onClick={() => { setSortBy("usage"); haptics.light(); }}>Usage</button>
            <button style={tab(sortBy === "alpha")} onClick={() => { setSortBy("alpha"); haptics.light(); }}>A–Z</button>
          </div>
        )}

        {/* List */}
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {films.map((f) => {
            if (merging) {
              const isSelected = selected.has(f.slug);
              return (
                <div
                  key={f.slug}
                  onClick={() => { toggleSelect(f.slug); haptics.light(); }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid var(--border-subtle)", cursor: "pointer", background: isSelected ? "rgba(217,119,6,0.06)" : "none" }}
                >
                  <div>
                    <div style={{ fontSize: 13, color: "var(--text-primary)" }}>{filmLabel(f)}</div>
                    <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>{filmSub(f)}</div>
                  </div>
                  <div style={{ width: 18, height: 18, borderRadius: 9, border: `2px solid ${isSelected ? "var(--accent)" : "var(--border)"}`, background: isSelected ? "var(--accent)" : "none" }} />
                </div>
              );
            }
            return (
              <Link
                key={f.slug}
                href={`/films/${encodeURIComponent(f.slug)}`}
                onClick={() => haptics.light()}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid var(--border-subtle)", cursor: "pointer", textDecoration: "none" }}
              >
                <div>
                  <div style={{ fontSize: 13, color: "var(--text-primary)" }}>{filmLabel(f)}</div>
                  <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>{filmSub(f)}</div>
                </div>
                <span style={{ fontSize: 18, color: "var(--border)", lineHeight: 1 }}>›</span>
              </Link>
            );
          })}
          {films.length === 0 && (
            <div style={{ padding: "48px 20px", textAlign: "center", fontSize: 13, color: "var(--text-tertiary)" }}>
              No films yet.
            </div>
          )}
        </div>

        {/* Merge panel */}
        {merging && selected.size >= 2 && (
          <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)" }}>
            <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-tertiary)", marginBottom: 12 }}>
              {selected.size} selected — keep which one?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {selectedFilms.map((f) => (
                <label key={f.slug} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, color: "var(--text-primary)" }}>
                  <input type="radio" name="target" value={f.slug} checked={targetId === f.slug} onChange={() => setTargetId(f.slug)} />
                  {filmLabel(f)}
                </label>
              ))}
            </div>
            {mergeError && <p style={{ fontSize: 11, color: "#f87171", marginBottom: 8 }}>{mergeError}</p>}
            <button
              onClick={handleMerge}
              disabled={!targetId || mergeSaving}
              style={{ width: "100%", padding: "12px 0", border: "1px solid #c2410c", color: "#c2410c", background: "none", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "inherit", cursor: "pointer", opacity: (!targetId || mergeSaving) ? 0.4 : 1 }}
            >
              {mergeSaving ? "Merging…" : `Merge into ${targetId || "…"}`}
            </button>
          </div>
        )}

        {/* Add row */}
        {!merging && (
          <div style={{ borderTop: "1px solid var(--border)", marginTop: 4 }}>
            <button onClick={() => { setShowForm(true); setError(""); haptics.light(); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "none", border: "none", width: "100%", fontFamily: "inherit", cursor: "pointer" }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Add Film</span>
              <span style={{ fontSize: 16, color: "var(--accent)", lineHeight: 1 }}>+</span>
            </button>
          </div>
        )}

        <Sheet open={showForm} onClose={() => { setShowForm(false); setError(""); }} title="Add Film">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <FormField label="ID (slug)" value={form.id} onChange={(v) => setForm((f) => ({ ...f, id: v }))} placeholder="portra-400" required />
            <FormField label="Brand" value={form.brand} onChange={(v) => setForm((f) => ({ ...f, brand: v }))} placeholder="Kodak" required />
            <FormField label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Portra 400" required />
            <FormField label="Nickname (optional)" value={form.nickname} onChange={(v) => setForm((f) => ({ ...f, nickname: v }))} placeholder="" />
            <FormField label="ISO" value={form.iso} onChange={(v) => setForm((f) => ({ ...f, iso: v }))} placeholder="400" inputMode="numeric" />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b5a52", marginBottom: 8 }}>Type</div>
              <div style={{ display: "flex", border: "1px solid var(--sheet-border)" }}>
                {[["colour", "Colour"], ["slide", "Slide"], ["bw", "B&W"]].map(([val, lbl]) => {
                  const active = val === "colour" ? (form.color && !form.slide) : val === "slide" ? form.slide : !form.color;
                  return (
                    <button
                      key={val} type="button"
                      onClick={() => setForm((f) => ({ ...f, color: val !== "bw", slide: val === "slide" }))}
                      style={{ flex: 1, padding: "8px 0", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: active ? "var(--sheet-text)" : "none", color: active ? "var(--sheet-bg)" : "#6b5a52", border: "none", borderLeft: val !== "colour" ? "1px solid var(--sheet-border)" : "none", fontFamily: "inherit", cursor: "pointer" }}
                    >
                      {lbl}
                    </button>
                  );
                })}
              </div>
            </div>
            {error && <p style={{ fontSize: 11, color: "#f87171" }}>{error}</p>}
            <FormButton type="submit" disabled={saving}>{saving ? "Saving…" : "Add Film"}</FormButton>
          </form>
        </Sheet>
      </div>
    </PullToRefresh>
  );
}
