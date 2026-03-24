"use client";

import { useState } from "react";
import type { Camera } from "@/lib/db";
import Sheet from "@/components/Sheet";
import { haptics } from "@/lib/haptics";
import { db } from "@/lib/offline-db";
import { addToSyncQueue, generateOfflineUuid, registerBackgroundSync } from "@/lib/sync-queue";
import { slugify } from "@/lib/slugify";

const FORMAT_OPTIONS = [
  { value: "135", label: "35mm" },
  { value: "120", label: "120" },
  { value: "4",   label: "4×5" },
];

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
  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
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
    try {
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
      haptics.success();
      onCreated(camera);
    } catch {
      if (!navigator.onLine) {
        const slug = slugify(`${brand}-${model}`);
        const tempUuid = generateOfflineUuid();
        const tempCamera: Camera = {
          uuid: tempUuid,
          slug,
          user_id: "",
          brand,
          model,
          nickname: nickname || null,
          format: Number(format),
        };
        await db.cameras.add(tempCamera);
        await addToSyncQueue("create_camera", { uuid: tempUuid, brand, model, nickname: nickname || undefined, format: Number(format) }, apiKey);
        await registerBackgroundSync();
        setBrand(""); setModel(""); setNickname(""); setFormat("135");
        haptics.success();
        onCreated(tempCamera);
      } else {
        setError("Network error — please try again");
        setSaving(false);
      }
    }
  }

  const fieldLabel: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
    color: "#6b5a52", marginBottom: 6, display: "block",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "none", border: "none", borderBottom: "1px solid var(--sheet-border)",
    padding: "8px 0", fontSize: 17, color: "var(--sheet-text)", fontFamily: "inherit",
    outline: "none", caretColor: "var(--accent)",
  };

  return (
    <Sheet open={open} onClose={onClose} title="New Camera">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={fieldLabel}>Brand</label>
          <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} required style={inputStyle} placeholder="Nikon" />
        </div>
        <div>
          <label style={fieldLabel}>Model</label>
          <input type="text" value={model} onChange={(e) => setModel(e.target.value)} required style={inputStyle} placeholder="FM2" />
        </div>
        <div>
          <label style={fieldLabel}>Nickname</label>
          <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} style={inputStyle} placeholder="optional" />
        </div>
        <div>
          <label style={fieldLabel}>Format</label>
          <div style={{ display: "flex", gap: 0, marginTop: 4 }}>
            {FORMAT_OPTIONS.map((opt) => {
              const active = format === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setFormat(opt.value); haptics.light(); }}
                  style={{
                    flex: 1, padding: "8px 0", fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "inherit",
                    border: "1px solid var(--sheet-border)",
                    marginLeft: opt.value === "135" ? 0 : -1,
                    backgroundColor: active ? "var(--sheet-text)" : "transparent",
                    color: active ? "var(--sheet-bg)" : "#6b5a52",
                    cursor: "pointer", position: "relative", zIndex: active ? 1 : 0,
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
        {error && <p style={{ fontSize: 11, color: "#c2410c", margin: 0 }}>{error}</p>}
        <button
          type="submit"
          disabled={saving}
          style={{
            width: "100%", padding: "14px 0",
            backgroundColor: saving ? "var(--sheet-border)" : "var(--accent)",
            color: "#fff",
            border: "none", cursor: saving ? "not-allowed" : "pointer",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
            fontFamily: "inherit",
          }}
        >
          {saving ? "Saving…" : "Add Camera"}
        </button>
      </form>
    </Sheet>
  );
}
