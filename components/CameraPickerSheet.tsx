"use client";

import { useEffect, useRef, useState } from "react";
import type { Camera } from "@/lib/db";
import Sheet from "@/components/Sheet";
import { haptics } from "@/lib/haptics";

function cameraLabel(c: Camera): string {
  return c.nickname ?? `${c.brand} ${c.model}`;
}

function CameraRow({
  label,
  format,
  rollCount,
  selected,
  onSelect,
}: {
  label: string;
  format: number;
  rollCount?: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const badgeMain = format === 120 ? "120" : format === 4 ? "4×5" : "35";
  const badgeSub = format === 135 ? "mm" : null;
  return (
    <button
      onClick={onSelect}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
        textAlign: "left", background: selected ? "#221e1b" : "none", border: "none",
        borderBottom: "1px solid var(--sheet-border)",
        cursor: "pointer", fontFamily: "inherit",
      }}
    >
      <div style={{
        width: 32, height: 32, flexShrink: 0,
        border: "1px solid var(--sheet-border)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column",
        fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: "#6b5a52",
      }}>
        {badgeMain}
        {badgeSub && <span style={{ fontSize: 7, letterSpacing: 0 }}>{badgeSub}</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 17, fontWeight: 500, color: "var(--sheet-text)", display: "block" }}>{label}</span>
        {rollCount != null && rollCount > 0 && (
          <div style={{ marginTop: 2 }}>
            <span style={{ fontSize: 14, color: "#6b5a52" }}>{rollCount} roll{rollCount !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>
      {selected && (
        <span style={{ fontSize: 17, color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>✓</span>
      )}
    </button>
  );
}

export default function CameraPickerSheet({
  open,
  onClose,
  cameras,
  value,
  onChange,
  onAddNew,
}: {
  open: boolean;
  onClose: () => void;
  cameras: Camera[];
  value: string;
  onChange: (slug: string) => void;
  onAddNew?: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [open]);

  const q = query.toLowerCase();
  const filtered = cameras.filter((c) => {
    if (!q) return true;
    return (
      c.brand.toLowerCase().includes(q) ||
      c.model.toLowerCase().includes(q) ||
      (c.nickname ?? "").toLowerCase().includes(q)
    );
  });

  function select(slug: string) {
    haptics.light();
    onChange(slug);
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="Camera">
      <div style={{ margin: "0 -24px", padding: "0 24px 12px", borderBottom: "1px solid var(--sheet-border)" }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cameras…"
          style={{
            width: "100%", backgroundColor: "#231f1c", border: "none",
            padding: "8px 12px", fontSize: 17, fontFamily: "inherit",
            color: "var(--sheet-text)", outline: "none", caretColor: "var(--accent)",
          }}
        />
      </div>

      <div style={{ margin: "4px -24px 0" }}>
        {value && !q && (
          <button
            onClick={() => select("")}
            style={{
              width: "100%", textAlign: "left", padding: "12px 16px", fontSize: 15,
              color: "#6b5a52", background: "none", border: "none",
              borderBottom: "1px solid var(--sheet-border)", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            — clear selection —
          </button>
        )}

        {filtered.map((c) => (
          <CameraRow
            key={c.slug}
            label={cameraLabel(c)}
            format={c.format}
            rollCount={c.roll_count}
            selected={value === c.slug}
            onSelect={() => select(c.slug)}
          />
        ))}

        {filtered.length === 0 && (
          <p style={{ padding: "32px 16px", fontSize: 15, color: "#6b5a52", textAlign: "center" }}>
            No cameras match &ldquo;{query}&rdquo;
          </p>
        )}

        {/* Add new — pinned at bottom */}
        {onAddNew && (
          <button
            onClick={() => { onClose(); onAddNew(); }}
            style={{
              width: "100%", textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "var(--accent)", background: "none", border: "none",
              borderTop: "1px solid var(--sheet-border)", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            + Add new camera
          </button>
        )}
      </div>
    </Sheet>
  );
}
