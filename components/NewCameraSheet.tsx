"use client";

import { useState } from "react";
import type { Camera } from "@/lib/db";
import Sheet from "@/components/Sheet";
import FormButton from "@/components/FormButton";

const labelCls = "block text-[10px] uppercase tracking-widest text-zinc-400";
const inputCls = "w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white py-2 text-base focus:outline-none transition-colors";
const selectCls = "w-full appearance-none rounded-none bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white py-2 text-base focus:outline-none transition-colors pr-6";

export default function NewCameraSheet({
  open,
  onClose,
  onCreated,
  authHeaders,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (camera: Camera) => void;
  authHeaders: HeadersInit;
}) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [nickname, setNickname] = useState("");
  const [format, setFormat] = useState("135");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const resp = await fetch("/api/cameras", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ brand, model, nickname: nickname || undefined, format: Number(format) }),
    });

    if (!resp.ok) {
      const data = await resp.json();
      setError(data.error ?? "Failed to create camera");
      setSaving(false);
      return;
    }

    const camera = await resp.json();
    setBrand(""); setModel(""); setNickname(""); setFormat("135");
    onCreated(camera);
  }

  return (
    <Sheet open={open} onClose={onClose} title="New Camera">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className={labelCls}>Brand</label>
          <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} required className={inputCls} placeholder="Nikon" />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Model</label>
          <input type="text" value={model} onChange={(e) => setModel(e.target.value)} required className={inputCls} placeholder="FM2" />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Nickname</label>
          <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} className={inputCls} placeholder="optional" />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Format</label>
          <div className="relative">
            <select value={format} onChange={(e) => setFormat(e.target.value)} className={selectCls}>
              <option value="135">135 (35mm)</option>
              <option value="120">120 (Medium format)</option>
              <option value="4">4×5 (Large format)</option>
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
  );
}
