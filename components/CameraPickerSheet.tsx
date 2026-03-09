"use client";

import { useEffect, useRef, useState } from "react";
import type { Camera } from "@/lib/db";
import Sheet from "@/components/Sheet";
import { haptics } from "@/lib/haptics";

function cameraLabel(c: Camera): string {
  return c.nickname ?? `${c.brand} ${c.model}`;
}

function formatLabel(format: number): string {
  if (format === 120) return "120";
  if (format === 4) return "4×5";
  return "35mm";
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
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors active:bg-zinc-100 dark:active:bg-zinc-800 ${selected ? "bg-amber-50 dark:bg-amber-900/20" : ""}`}
    >
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium truncate block">{label}</span>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-zinc-400">{formatLabel(format)}</span>
          {rollCount != null && rollCount > 0 && (
            <span className="text-[11px] text-zinc-400">{rollCount} roll{rollCount !== 1 ? "s" : ""}</span>
          )}
        </div>
      </div>
      {selected && (
        <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
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
}: {
  open: boolean;
  onClose: () => void;
  cameras: Camera[];
  value: string;
  onChange: (slug: string) => void;
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
      <div className="-mx-6 px-6 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cameras…"
          className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none placeholder:text-zinc-400"
        />
      </div>

      <div className="-mx-6 mt-1">
        {value && !q && (
          <button
            onClick={() => select("")}
            className="w-full text-left px-4 py-3 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors border-b border-zinc-100 dark:border-zinc-800"
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
          <p className="px-4 py-8 text-sm text-zinc-400 text-center">No cameras match "{query}"</p>
        )}
      </div>
    </Sheet>
  );
}
