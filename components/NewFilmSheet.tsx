"use client";

import { useState } from "react";
import type { Film } from "@/lib/db";
import Sheet from "@/components/Sheet";
import FormButton from "@/components/FormButton";

const labelCls = "block text-[10px] uppercase tracking-widest text-zinc-400";
const inputCls = "w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white py-2 text-base focus:outline-none transition-colors";

export default function NewFilmSheet({
  open,
  onClose,
  onCreated,
  authHeaders,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (film: Film) => void;
  authHeaders: HeadersInit;
}) {
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [iso, setIso] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const resp = await fetch("/api/films", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({
        brand,
        name,
        nickname: nickname || undefined,
        iso: iso ? Number(iso) : undefined,
        color: true,
        show_iso: !!iso,
      }),
    });

    if (!resp.ok) {
      const data = await resp.json();
      setError(data.error ?? "Failed to create film");
      setSaving(false);
      return;
    }

    const film = await resp.json();
    setBrand(""); setName(""); setNickname(""); setIso("");
    onCreated(film);
  }

  return (
    <Sheet open={open} onClose={onClose} title="New Film">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className={labelCls}>Brand</label>
          <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} required className={inputCls} placeholder="Kodak" />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} placeholder="Portra 400" />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Nickname</label>
          <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} className={inputCls} placeholder="optional" />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>ISO</label>
          <input type="number" value={iso} onChange={(e) => setIso(e.target.value)} className={inputCls} placeholder="400" />
        </div>
        {error && <p className="text-red-400 text-xs tracking-wide">{error}</p>}
        <FormButton type="submit" disabled={saving}>
          {saving ? "Saving…" : "Add Film"}
        </FormButton>
      </form>
    </Sheet>
  );
}
