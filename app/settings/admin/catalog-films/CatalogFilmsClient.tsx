"use client";

import { useState } from "react";
import type { CatalogFilm } from "@/lib/db";
import Sheet from "@/components/Sheet";
import FormButton from "@/components/FormButton";

const labelCls = "block text-[10px] uppercase tracking-widest";
const labelStyle = { color: "var(--darkroom-text-secondary)" };
const inputCls = "w-full bg-transparent border-b py-2 text-base focus:outline-none transition-colors";
const inputStyle = { borderColor: "var(--darkroom-border)", color: "var(--darkroom-text-primary)" };

function GradientSwatch({ from, to }: { from: string | null; to: string | null }) {
  const style = from && to
    ? { background: `linear-gradient(to bottom, ${from}, ${to})` }
    : { background: "#d4d4d8" };
  return <div className="w-2 self-stretch rounded-full shrink-0" style={style} />;
}

type FormState = {
  slug: string;
  brand: string;
  name: string;
  nickname: string;
  iso: string;
  color: boolean;
  show_iso: boolean;
  gradient_from: string;
  gradient_to: string;
};

const empty: FormState = {
  slug: "", brand: "", name: "", nickname: "", iso: "",
  color: true, show_iso: false, gradient_from: "", gradient_to: "",
};

function filmToForm(f: CatalogFilm): FormState {
  return {
    slug: f.slug,
    brand: f.brand,
    name: f.name,
    nickname: f.nickname ?? "",
    iso: f.iso != null ? String(f.iso) : "",
    color: f.color,
    show_iso: f.show_iso,
    gradient_from: f.gradient_from ?? "",
    gradient_to: f.gradient_to ?? "",
  };
}

export default function CatalogFilmsClient({ initialFilms }: { initialFilms: CatalogFilm[] }) {
  const [films, setFilms] = useState(initialFilms);
  const [editing, setEditing] = useState<CatalogFilm | null | "new">(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function openNew() {
    setForm(empty);
    setError("");
    setEditing("new");
  }

  function openEdit(f: CatalogFilm) {
    setForm(filmToForm(f));
    setError("");
    setEditing(f);
  }

  function closeSheet() {
    setEditing(null);
    setError("");
  }

  function set(key: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = {
      slug: form.slug,
      brand: form.brand,
      name: form.name,
      nickname: form.nickname || undefined,
      iso: form.iso ? Number(form.iso) : undefined,
      color: form.color,
      show_iso: form.show_iso,
      gradient_from: form.gradient_from || undefined,
      gradient_to: form.gradient_to || undefined,
    };

    try {
      const isNew = editing === "new";
      const resp = await fetch(
        isNew ? "/api/catalog/films" : `/api/catalog/films/${(editing as CatalogFilm).slug}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setError(data.error ?? "Failed to save");
        return;
      }

      const saved: CatalogFilm = await resp.json();
      if (isNew) {
        setFilms((prev) => [...prev, saved].sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name)));
      } else {
        setFilms((prev) => prev.map((f) => (f.slug === saved.slug ? saved : f)));
      }
      closeSheet();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (editing === "new" || !editing) return;
    if (!confirm(`Delete "${editing.nickname ?? editing.name}"?`)) return;

    setSaving(true);
    await fetch(`/api/catalog/films/${editing.slug}`, { method: "DELETE" });
    setFilms((prev) => prev.filter((f) => f.slug !== (editing as CatalogFilm).slug));
    closeSheet();
    setSaving(false);
  }

  const sheetTitle = editing === "new" ? "New Film" : "Edit Film";

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm" style={{ color: "var(--darkroom-text-secondary)" }}>{films.length} films</span>
        <button
          onClick={openNew}
          className="text-sm font-medium transition-opacity active:opacity-60"
          style={{ color: "var(--darkroom-accent)" }}
        >
          + Add film
        </button>
      </div>

      <ul className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--darkroom-card)" }}>
        {films.map((f) => (
          <li key={f.slug} className="border-b" style={{ borderColor: "var(--darkroom-border)" }}>
            <button
              onClick={() => openEdit(f)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left active:opacity-60 transition-opacity"
            >
              <GradientSwatch from={f.gradient_from} to={f.gradient_to} />
              <div className="flex-1 min-w-0">
                <span className="text-[15px] font-medium truncate block">
                  {f.nickname ?? `${f.brand} ${f.name}`}
                </span>
                <span className="text-xs" style={{ color: "var(--darkroom-text-secondary)" }}>
                  {f.brand} · {f.color ? "Color" : "B&W"}{f.iso ? ` · ISO ${f.iso}` : ""}
                </span>
              </div>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ color: "var(--darkroom-text-tertiary)" }}><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </li>
        ))}
      </ul>

      <Sheet open={editing !== null} onClose={closeSheet} title={sheetTitle}>
        <form onSubmit={handleSave} className="space-y-5">
          {editing === "new" && (
            <div className="space-y-1">
              <label className={labelCls} style={labelStyle}>Slug</label>
              <input type="text" value={form.slug} onChange={(e) => set("slug", e.target.value)} required className={inputCls} style={inputStyle} placeholder="kodak-gold-200" />
            </div>
          )}
          <div className="space-y-1">
            <label className={labelCls} style={labelStyle}>Brand</label>
            <input type="text" value={form.brand} onChange={(e) => set("brand", e.target.value)} required className={inputCls} style={inputStyle} placeholder="Kodak" />
          </div>
          <div className="space-y-1">
            <label className={labelCls} style={labelStyle}>Name</label>
            <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} required className={inputCls} style={inputStyle} placeholder="Gold" />
          </div>
          <div className="space-y-1">
            <label className={labelCls} style={labelStyle}>Nickname</label>
            <input type="text" value={form.nickname} onChange={(e) => set("nickname", e.target.value)} className={inputCls} style={inputStyle} placeholder="Kodak Gold 200" />
          </div>
          <div className="space-y-1">
            <label className={labelCls} style={labelStyle}>ISO</label>
            <input type="number" value={form.iso} onChange={(e) => set("iso", e.target.value)} className={inputCls} style={inputStyle} placeholder="200" />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.color} onChange={(e) => set("color", e.target.checked)} className="accent-amber-500" />
              Color
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.show_iso} onChange={(e) => set("show_iso", e.target.checked)} className="accent-amber-500" />
              Show ISO
            </label>
          </div>

          {/* Gradient preview */}
          <div className="space-y-2">
            <label className={labelCls} style={labelStyle}>Gradient</label>
            <div className="flex items-center gap-3">
              <GradientSwatch from={form.gradient_from || null} to={form.gradient_to || null} />
              <div className="flex-1 space-y-2">
                <input type="text" value={form.gradient_from} onChange={(e) => set("gradient_from", e.target.value)} className="w-full bg-transparent border-b py-2 text-base focus:outline-none transition-colors font-mono text-sm" style={inputStyle} placeholder="#fbbf24 (top)" />
                <input type="text" value={form.gradient_to} onChange={(e) => set("gradient_to", e.target.value)} className="w-full bg-transparent border-b py-2 text-base focus:outline-none transition-colors font-mono text-sm" style={inputStyle} placeholder="#f59e0b (bottom)" />
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs tracking-wide">{error}</p>}

          <FormButton type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </FormButton>

          {editing !== "new" && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="w-full py-2 text-sm text-red-400 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              Delete film
            </button>
          )}
        </form>
      </Sheet>
    </>
  );
}
