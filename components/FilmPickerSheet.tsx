"use client";

import { useEffect, useRef, useState } from "react";
import type { Film, CatalogFilm } from "@/lib/db";
import Sheet from "@/components/Sheet";
import { haptics } from "@/lib/haptics";
import { FILM_GRADIENTS } from "@/lib/film-gradients";

function filmLabel(f: Film | CatalogFilm): string {
  if (f.nickname) return f.nickname;
  const iso = f.show_iso && f.iso ? ` ${f.iso}` : "";
  return `${f.brand} ${f.name}${iso}`;
}

function gradientStyle(from: string | null | undefined, to: string | null | undefined, slug?: string): React.CSSProperties {
  if (from && to) return { background: `linear-gradient(to bottom, ${from}, ${to})` };
  const fallback = slug ? FILM_GRADIENTS[slug] : undefined;
  if (fallback) return { background: `linear-gradient(to bottom, ${fallback[0]}, ${fallback[1]})` };
  return { background: "var(--border)" };
}

function FilmRow({
  label,
  iso,
  color,
  gradientFrom,
  gradientTo,
  slug,
  rollCount,
  selected,
  onSelect,
}: {
  label: string;
  iso: number | null;
  color: boolean;
  gradientFrom?: string | null;
  gradientTo?: string | null;
  slug?: string;
  rollCount?: number;
  selected: boolean;
  onSelect: () => void;
}) {
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
      <div style={{ width: 4, alignSelf: "stretch", flexShrink: 0, minHeight: 36, borderRadius: 2, ...gradientStyle(gradientFrom, gradientTo, slug) }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 17, fontWeight: 500, color: "var(--sheet-text)", display: "block" }}>{label}</span>
        <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
          {iso ? <span style={{ fontSize: 14, color: "#6b5a52" }}>ISO {iso}</span> : null}
          <span style={{ fontSize: 14, color: "#6b5a52" }}>{color ? "Colour" : "B&W"}</span>
          {rollCount != null && rollCount > 0 && (
            <span style={{ fontSize: 14, color: "#6b5a52" }}>{rollCount} roll{rollCount !== 1 ? "s" : ""}</span>
          )}
        </div>
      </div>
      {selected && (
        <span style={{ fontSize: 17, color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>✓</span>
      )}
    </button>
  );
}

export default function FilmPickerSheet({
  open,
  onClose,
  films,
  catalogFilms,
  value,
  onChange,
  onAddNew,
}: {
  open: boolean;
  onClose: () => void;
  films: Film[];
  catalogFilms: CatalogFilm[];
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

  function matches(f: Film | CatalogFilm) {
    if (!q) return true;
    return (
      f.brand.toLowerCase().includes(q) ||
      f.name.toLowerCase().includes(q) ||
      (f.nickname ?? "").toLowerCase().includes(q)
    );
  }

  const catalogBySlug = new Map(catalogFilms.map((c) => [c.slug, c]));
  const myFilms = films.filter(matches);
  const catalogOnly = catalogFilms.filter((c) => !films.some((f) => f.slug === c.slug) && matches(c));

  function select(slug: string) {
    haptics.light();
    onChange(slug);
    onClose();
  }

  const sectionLabel: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
    color: "#6b5a52", padding: "10px 16px 6px", display: "block",
  };

  return (
    <Sheet open={open} onClose={onClose} title="Film">
      <div style={{ margin: "0 -24px", padding: "0 24px 12px", borderBottom: "1px solid var(--sheet-border)" }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search films…"
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

        {myFilms.length > 0 && (
          <>
            {!q && <span style={sectionLabel}>My Films</span>}
            {myFilms.map((f) => {
              const cat = catalogBySlug.get(f.slug);
              return (
                <FilmRow
                  key={f.slug}
                  label={filmLabel(f)}
                  iso={f.iso}
                  color={f.color}
                  gradientFrom={cat?.gradient_from}
                  gradientTo={cat?.gradient_to}
                  slug={f.slug}
                  rollCount={(f as Film).roll_count}
                  selected={value === f.slug}
                  onSelect={() => select(f.slug)}
                />
              );
            })}
          </>
        )}

        {catalogOnly.length > 0 && (
          <>
            {!q && <span style={sectionLabel}>Catalog</span>}
            {catalogOnly.map((f) => (
              <FilmRow
                key={f.slug}
                label={filmLabel(f)}
                iso={f.iso}
                color={f.color}
                gradientFrom={f.gradient_from}
                gradientTo={f.gradient_to}
                slug={f.slug}
                selected={value === f.slug}
                onSelect={() => select(f.slug)}
              />
            ))}
          </>
        )}

        {myFilms.length === 0 && catalogOnly.length === 0 && (
          <p style={{ padding: "32px 16px", fontSize: 15, color: "#6b5a52", textAlign: "center" }}>
            No films match &ldquo;{query}&rdquo;
          </p>
        )}

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
            + Add new film
          </button>
        )}
      </div>
    </Sheet>
  );
}
