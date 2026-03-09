"use client";

import { useEffect, useRef, useState } from "react";
import type { Film, CatalogFilm } from "@/lib/db";
import Sheet from "@/components/Sheet";
import { haptics } from "@/lib/haptics";

function filmLabel(f: Film | CatalogFilm): string {
  if (f.nickname) return f.nickname;
  const iso = f.show_iso && f.iso ? ` ${f.iso}` : "";
  return `${f.brand} ${f.name}${iso}`;
}

const FILM_GRADIENTS: Record<string, [string, string]> = {
  "adox-color-mission-200": ["#f97316", "#2d7d6e"],
  "berlin-400":             ["#1e3a5f", "#0f172a"],
  "cinestill-400d":         ["#7c3aed", "#09090b"],
  "color-plus":             ["#fde047", "#facc15"],
  "earl-grey":              ["#a1a1aa", "#71717a"],
  "ektar-100":              ["#dc2626", "#991b1b"],
  "foma-400":               ["#71717a", "#52525b"],
  "fuji-c200":              ["#4ade80", "#16a34a"],
  "fuji-superia-200":       ["#4ade80", "#16a34a"],
  "fuji-superia-400":       ["#22c55e", "#15803d"],
  "gold-200":               ["#fbbf24", "#f59e0b"],
  "ilford-hp5":             ["#4ade80", "#e4e4e7"],
  "kentmere-100":           ["#60a5fa", "#93c5fd"],
  "kentmere-400":           ["#7c3aed", "#ec4899"],
  "kiro-400":               ["#f472b6", "#ec4899"],
  "lomo-400":               ["#22d3ee", "#06b6d4"],
  "lomo-800":               ["#c084fc", "#a855f7"],
  "portra-160":             ["#fed7aa", "#fdba74"],
  "portra-400":             ["#fdba74", "#fb923c"],
  "portra-800":             ["#fb923c", "#f97316"],
  "psych-blue":             ["#818cf8", "#6366f1"],
  "redscale-50":            ["#f97316", "#dc2626"],
  "rollei-400s":            ["#78716c", "#57534e"],
  "rollei-superpan-200":    ["#64748b", "#475569"],
  "sensia-50":              ["#16a34a", "#3b82f6"],
  "sora-200":               ["#38bdf8", "#0ea5e9"],
  "trix-400":               ["#3f3f46", "#18181b"],
  "ultramax":               ["#ffd700", "#2563eb"],
  "vision3-250d":           ["#fbbf24", "#1c1917"],
  "xpro-200":               ["#fb923c", "#f97316"],
};

function gradientStyle(from: string | null | undefined, to: string | null | undefined, slug?: string): React.CSSProperties {
  if (from && to) return { background: `linear-gradient(to bottom, ${from}, ${to})` };
  const fallback = slug ? FILM_GRADIENTS[slug] : undefined;
  if (fallback) return { background: `linear-gradient(to bottom, ${fallback[0]}, ${fallback[1]})` };
  return { background: "#d4d4d8" };
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
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors active:bg-zinc-100 dark:active:bg-zinc-800 ${selected ? "bg-amber-50 dark:bg-amber-900/20" : ""}`}
    >
      {/* Gradient swatch */}
      <div
        className="w-2 self-stretch rounded-full shrink-0"
        style={gradientStyle(gradientFrom, gradientTo, slug)}
      />
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium truncate block">{label}</span>
        <div className="flex items-center gap-2 mt-0.5">
          {iso ? <span className="text-[11px] text-zinc-400">ISO {iso}</span> : null}
          <span className="text-[11px] text-zinc-400">{color ? "Color" : "B&W"}</span>
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

export default function FilmPickerSheet({
  open,
  onClose,
  films,
  catalogFilms,
  value,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  films: Film[];
  catalogFilms: CatalogFilm[];
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

  function matches(f: Film | CatalogFilm) {
    if (!q) return true;
    return (
      f.brand.toLowerCase().includes(q) ||
      f.name.toLowerCase().includes(q) ||
      (f.nickname ?? "").toLowerCase().includes(q)
    );
  }

  // Build a slug→gradient map from catalog
  const catalogBySlug = new Map(catalogFilms.map((c) => [c.slug, c]));

  const myFilms = films.filter(matches);
  const catalogOnly = catalogFilms.filter(
    (c) => !films.some((f) => f.slug === c.slug) && matches(c),
  );

  function select(slug: string) {
    haptics.light();
    onChange(slug);
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="Film">
      {/* Search */}
      <div className="-mx-6 px-6 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search films…"
          className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none placeholder:text-zinc-400"
        />
      </div>

      <div className="-mx-6 mt-1">
        {/* Clear selection */}
        {value && !q && (
          <button
            onClick={() => select("")}
            className="w-full text-left px-4 py-3 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors border-b border-zinc-100 dark:border-zinc-800"
          >
            — clear selection —
          </button>
        )}

        {/* My films */}
        {myFilms.length > 0 && (
          <>
            {!q && (
              <div className="px-4 pt-3 pb-1">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">My Films</span>
              </div>
            )}
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

        {/* Catalog films */}
        {catalogOnly.length > 0 && (
          <>
            {!q && (
              <div className="px-4 pt-3 pb-1">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Catalog</span>
              </div>
            )}
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
          <p className="px-4 py-8 text-sm text-zinc-400 text-center">No films match "{query}"</p>
        )}
      </div>
    </Sheet>
  );
}
