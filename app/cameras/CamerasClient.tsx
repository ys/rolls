"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Camera } from "@/lib/db";
import PullToRefresh from "@/components/PullToRefresh";
import BackButton from "@/components/BackButton";
import FormField from "@/components/FormField";
import FormButton from "@/components/FormButton";
import Sheet from "@/components/Sheet";
import { haptics } from "@/lib/haptics";

function cameraLabel(c: Camera): string {
  return c.nickname ?? `${c.brand} ${c.model}`;
}

function formatLabel(format: number): string {
  if (format === 135) return "35mm";
  if (format === 120) return "120";
  return `${format}`;
}

const tab = (active: boolean): React.CSSProperties => ({
  fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
  background: "none", border: "none",
  borderBottom: active ? "1.5px solid var(--accent)" : "1.5px solid transparent",
  color: active ? "var(--accent)" : "var(--text-tertiary)",
  paddingBottom: 2, fontFamily: "inherit", cursor: "pointer",
});

export default function CamerasClient({ initialCameras }: { initialCameras: Camera[] }) {
  const router = useRouter();
  const [allCameras, setAllCameras] = useState(initialCameras);
  const [sortBy, setSortBy] = useState<"usage" | "alpha">("usage");
  const [form, setForm] = useState({ id: "", brand: "", model: "", nickname: "", format: "135" });
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

  const cameras = sortBy === "alpha"
    ? [...allCameras].sort((a, b) => cameraLabel(a).localeCompare(cameraLabel(b)))
    : [...allCameras].sort((a, b) => (b.roll_count ?? 0) - (a.roll_count ?? 0));

  async function handleRefresh() {
    const resp = await fetch("/api/cameras", { headers: headers() });
    if (resp.ok) { setAllCameras(await resp.json()); router.refresh(); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    const resp = await fetch("/api/cameras", {
      method: "POST",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({ ...form, format: parseInt(form.format, 10) }),
    });
    if (!resp.ok) {
      const data = await resp.json();
      setError(data.error ?? "Failed to create camera");
      setSaving(false); haptics.error(); return;
    }
    const camera = await resp.json();
    setAllCameras((prev) => [...prev.filter((c) => c.slug !== camera.slug), camera]);

    setForm({ id: "", brand: "", model: "", nickname: "", format: "135" });
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
    const resp = await fetch("/api/cameras/merge", {
      method: "POST",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({ target_id: targetId, source_ids }),
    });
    if (!resp.ok) {
      const data = await resp.json();
      setMergeError(data.error ?? "Merge failed");
      setMergeSaving(false); haptics.error(); return;
    }
    const updated = await fetch("/api/cameras", { headers: headers() }).then((r) => r.json());
    setAllCameras(updated);

    setSelected(new Set()); setTargetId(""); setMerging(false); setMergeSaving(false);
    haptics.success(); router.refresh();
  }

  const selectedCameras = allCameras.filter((c) => selected.has(c.slug));

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div style={{ paddingBottom: 80 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px", borderBottom: "1px solid var(--border)" }}>
          <BackButton label="···" />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-primary)" }}>Cameras</span>
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
          {cameras.map((c) => {
            const sub = `${formatLabel(c.format)}${c.roll_count ? ` · ${c.roll_count} roll${c.roll_count === 1 ? "" : "s"}` : ""}`;
            if (merging) {
              const isSelected = selected.has(c.slug);
              return (
                <div
                  key={c.slug}
                  onClick={() => { toggleSelect(c.slug); haptics.light(); }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid var(--border-subtle)", cursor: "pointer", background: isSelected ? "rgba(217,119,6,0.06)" : "none" }}
                >
                  <div>
                    <div style={{ fontSize: 13, color: "var(--text-primary)" }}>{cameraLabel(c)}</div>
                    <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>{sub}</div>
                  </div>
                  <div style={{ width: 18, height: 18, borderRadius: 9, border: `2px solid ${isSelected ? "var(--accent)" : "var(--border)"}`, background: isSelected ? "var(--accent)" : "none" }} />
                </div>
              );
            }
            return (
              <Link
                key={c.slug}
                href={`/cameras/${encodeURIComponent(c.slug)}`}
                onClick={() => haptics.light()}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid var(--border-subtle)", cursor: "pointer", textDecoration: "none" }}
              >
                <div>
                  <div style={{ fontSize: 13, color: "var(--text-primary)" }}>{cameraLabel(c)}</div>
                  <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>{sub}</div>
                </div>
                <span style={{ fontSize: 18, color: "var(--border)", lineHeight: 1 }}>›</span>
              </Link>
            );
          })}
          {cameras.length === 0 && (
            <div style={{ padding: "48px 20px", textAlign: "center", fontSize: 13, color: "var(--text-tertiary)" }}>
              No cameras yet.
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
              {selectedCameras.map((c) => (
                <label key={c.slug} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, color: "var(--text-primary)" }}>
                  <input type="radio" name="target" value={c.slug} checked={targetId === c.slug} onChange={() => setTargetId(c.slug)} />
                  {cameraLabel(c)}
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
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Add Camera</span>
              <span style={{ fontSize: 16, color: "var(--accent)", lineHeight: 1 }}>+</span>
            </button>
          </div>
        )}

        <Sheet open={showForm} onClose={() => { setShowForm(false); setError(""); }} title="Add Camera">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <FormField label="ID (slug)" value={form.id} onChange={(v) => setForm((f) => ({ ...f, id: v }))} placeholder="leica-m6" required />
            <FormField label="Brand" value={form.brand} onChange={(v) => setForm((f) => ({ ...f, brand: v }))} placeholder="Leica" required />
            <FormField label="Model" value={form.model} onChange={(v) => setForm((f) => ({ ...f, model: v }))} placeholder="M6" required />
            <FormField label="Nickname (optional)" value={form.nickname} onChange={(v) => setForm((f) => ({ ...f, nickname: v }))} placeholder="" />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b5a52", marginBottom: 8 }}>Format</div>
              <div style={{ display: "flex", border: "1px solid var(--sheet-border)" }}>
                {[["135", "35mm"], ["120", "120"]].map(([val, lbl]) => (
                  <button
                    key={val} type="button"
                    onClick={() => setForm((f) => ({ ...f, format: val }))}
                    style={{ flex: 1, padding: "8px 0", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: form.format === val ? "var(--sheet-text)" : "none", color: form.format === val ? "var(--sheet-bg)" : "#6b5a52", border: "none", borderLeft: val !== "135" ? "1px solid var(--sheet-border)" : "none", fontFamily: "inherit", cursor: "pointer" }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            {error && <p style={{ fontSize: 11, color: "#f87171" }}>{error}</p>}
            <FormButton type="submit" disabled={saving}>{saving ? "Saving…" : "Add Camera"}</FormButton>
          </form>
        </Sheet>
      </div>
    </PullToRefresh>
  );
}
