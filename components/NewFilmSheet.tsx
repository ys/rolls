"use client";

import { useState } from "react";
import type { Film } from "@/lib/db";
import Sheet from "@/components/Sheet";
import { haptics } from "@/lib/haptics";

const TYPE_OPTIONS = [
  { value: "colour", label: "Colour" },
  { value: "bw",     label: "B&W" },
  { value: "slide",  label: "Slide" },
];

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
  const [id, setId] = useState("");
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [iso, setIso] = useState("");
  const [filmType, setFilmType] = useState("colour");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const filmBody = {
      id: id || undefined,
      brand,
      name,
      nickname: nickname || undefined,
      iso: iso ? Number(iso) : undefined,
      color: filmType !== "bw",
      slide: filmType === "slide",
      show_iso: !!iso,
    };

    try {
      const resp = await fetch("/api/films", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(filmBody),
      });
      if (!resp.ok) {
        const data = await resp.json();
        setError(data.error ?? "Failed to create film");
        setSaving(false);
        return;
      }
      const film = await resp.json();
      setId(""); setBrand(""); setName(""); setNickname(""); setIso(""); setFilmType("colour");
      haptics.success();
      onCreated(film);
    } catch {
      setError("Network error — please try again");
      setSaving(false);
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
    <Sheet open={open} onClose={onClose} title="New Film">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={fieldLabel}>Slug</label>
          <input type="text" value={id} onChange={(e) => setId(e.target.value)} style={inputStyle} placeholder="portra-400 (auto if blank)" />
        </div>
        <div>
          <label style={fieldLabel}>Brand</label>
          <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} required style={inputStyle} placeholder="Kodak" />
        </div>
        <div>
          <label style={fieldLabel}>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} placeholder="Portra 400" />
        </div>
        <div>
          <label style={fieldLabel}>Nickname</label>
          <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} style={inputStyle} placeholder="optional" />
        </div>
        <div>
          <label style={fieldLabel}>ISO</label>
          <input type="number" value={iso} onChange={(e) => setIso(e.target.value)} style={inputStyle} placeholder="400" />
        </div>
        <div>
          <label style={fieldLabel}>Type</label>
          <div style={{ display: "flex", gap: 0, marginTop: 4 }}>
            {TYPE_OPTIONS.map((opt) => {
              const active = filmType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setFilmType(opt.value); haptics.light(); }}
                  style={{
                    flex: 1, padding: "8px 0", fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "inherit",
                    border: "1px solid var(--sheet-border)",
                    marginLeft: opt.value === "colour" ? 0 : -1,
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
          {saving ? "Saving…" : "Add Film"}
        </button>
      </form>
    </Sheet>
  );
}
