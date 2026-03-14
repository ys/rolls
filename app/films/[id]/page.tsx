"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import type { Film } from "@/lib/db";
import BackButton from "@/components/BackButton";
import { haptics } from "@/lib/haptics";

const field = {
  label: { fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "var(--text-tertiary)", marginBottom: 6 },
  input: { fontSize: 14, color: "var(--text-primary)", background: "none", border: "none", borderBottom: "1px solid var(--border)", borderBottomWidth: 1, borderBottomStyle: "solid" as const, borderBottomColor: "var(--border)", width: "100%", fontFamily: "inherit", outline: "none", caretColor: "var(--text-primary)", paddingBottom: 10 },
};

export default function EditFilmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [form, setForm] = useState({ brand: "", name: "", nickname: "", iso: "", color: true, show_iso: false });
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
    fetch(`/api/films/${encodeURIComponent(id)}`, { headers: headers() })
      .then((r) => r.json())
      .then((f: Film & { roll_count: number }) => {
        setForm({ brand: f.brand ?? "", name: f.name ?? "", nickname: f.nickname ?? "", iso: f.iso ? String(f.iso) : "", color: f.color ?? true, show_iso: f.show_iso ?? false });
        setRollCount(f.roll_count ?? 0);
        setLoading(false);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaved(false); setError("");
    const resp = await fetch(`/api/films/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({ ...form, iso: form.iso ? parseInt(form.iso, 10) : null }),
    });
    if (!resp.ok) {
      const data = await resp.json();
      setError(data.error ?? "Failed to save");
      setSaving(false); return;
    }
    setSaved(true); setSaving(false); haptics.success();
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this film? This cannot be undone.")) return;
    setDeleting(true); setError("");
    const resp = await fetch(`/api/films/${encodeURIComponent(id)}`, { method: "DELETE", headers: headers() });
    if (resp.ok) { router.push("/films"); }
    else { const data = await resp.json(); setError(data.error ?? "Failed to delete"); setDeleting(false); }
  }

  if (loading) return <div style={{ textAlign: "center", padding: "64px 20px", fontSize: 13, color: "var(--text-tertiary)" }}>Loading…</div>;

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px", borderBottom: "1px solid var(--border)" }}>
        <BackButton label="Films" />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-primary)" }}>Edit Film</span>
        <div style={{ width: 48 }} />
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Brand */}
          <div>
            <div style={field.label}>Brand</div>
            <input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} required style={field.input} />
          </div>
          {/* Name */}
          <div>
            <div style={field.label}>Name</div>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required style={field.input} />
          </div>
          {/* Nickname */}
          <div>
            <div style={field.label}>Nickname <span style={{ textTransform: "none", fontWeight: 400, opacity: 0.6 }}>(optional)</span></div>
            <input value={form.nickname} onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))} style={{ ...field.input, fontStyle: form.nickname ? "normal" : "italic", color: form.nickname ? "var(--text-primary)" : "var(--text-tertiary)" }} placeholder="—" />
          </div>
          {/* ISO */}
          <div>
            <div style={field.label}>ISO</div>
            <input value={form.iso} onChange={(e) => setForm((f) => ({ ...f, iso: e.target.value }))} inputMode="numeric" style={field.input} placeholder="400" />
          </div>
          {/* Type */}
          <div>
            <div style={{ ...field.label, marginBottom: 8 }}>Type</div>
            <div style={{ display: "flex", border: "1px solid var(--border)" }}>
              {[["colour", "Colour"], ["bw", "B&W"]].map(([val, lbl]) => {
                const active = val === "colour" ? form.color : !form.color;
                return (
                  <button
                    key={val} type="button"
                    onClick={() => setForm((f) => ({ ...f, color: val === "colour" }))}
                    style={{ flex: 1, padding: "8px 0", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: active ? "var(--text-primary)" : "none", color: active ? "var(--bg)" : "var(--text-tertiary)", border: "none", borderLeft: val !== "colour" ? "1px solid var(--border)" : "none", fontFamily: "inherit", cursor: "pointer" }}
                  >
                    {lbl}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p style={{ fontSize: 11, color: "#f87171" }}>{error}</p>}
        </div>

        {/* Save button */}
        <div style={{ padding: "0 20px 24px" }}>
          <button
            type="submit"
            disabled={saving}
            style={{ width: "100%", padding: "14px 0", background: saved ? "var(--text-primary)" : "var(--accent)", color: saved ? "var(--bg)" : "var(--text-primary)", border: "none", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "inherit", cursor: "pointer", opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save Film"}
          </button>
        </div>
      </form>

      {/* Delete */}
      {rollCount === 0 && (
        <div style={{ padding: "0 20px", borderTop: "1px solid var(--border)", paddingTop: 24, marginTop: 8 }}>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{ width: "100%", padding: "12px 0", background: "none", border: "1px solid #c2410c", color: "#c2410c", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "inherit", cursor: "pointer", opacity: deleting ? 0.5 : 1 }}
          >
            {deleting ? "Deleting…" : "Delete Film"}
          </button>
        </div>
      )}
    </div>
  );
}
