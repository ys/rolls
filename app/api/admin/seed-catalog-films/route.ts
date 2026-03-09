import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

const CATALOG: Array<{
  slug: string; brand: string; name: string; nickname: string;
  iso: number; color: boolean; show_iso: boolean;
  gradient_from: string; gradient_to: string;
}> = [
  { slug: "adox-color-mission-200", brand: "Adox",           name: "Color Mission",  nickname: "Adox Color Mission 200",        iso: 200, color: true,  show_iso: false, gradient_from: "#f97316", gradient_to: "#2d7d6e" },
  { slug: "berlin-400",             brand: "Lomography",     name: "Berlin",         nickname: "Lomography Berlin 400",          iso: 400, color: false, show_iso: true,  gradient_from: "#1e3a5f", gradient_to: "#0f172a" },
  { slug: "cinestill-400d",         brand: "Cinestill",      name: "400D",           nickname: "CineStill 400D",                 iso: 400, color: true,  show_iso: false, gradient_from: "#7c3aed", gradient_to: "#09090b" },
  { slug: "color-plus",             brand: "Kodak",          name: "Color Plus",     nickname: "Kodak Color Plus 200",           iso: 200, color: true,  show_iso: false, gradient_from: "#fde047", gradient_to: "#facc15" },
  { slug: "earl-grey",              brand: "Lomography",     name: "Earl Grey",      nickname: "Lomography Earl Grey 100",       iso: 100, color: false, show_iso: true,  gradient_from: "#a1a1aa", gradient_to: "#71717a" },
  { slug: "ektar-100",              brand: "Kodak",          name: "Ektar",          nickname: "Kodak Ektar 100",                iso: 100, color: true,  show_iso: false, gradient_from: "#dc2626", gradient_to: "#991b1b" },
  { slug: "foma-400",               brand: "Fomapan",        name: "Action",         nickname: "Fomapan Action 400",             iso: 400, color: false, show_iso: true,  gradient_from: "#71717a", gradient_to: "#52525b" },
  { slug: "fuji-c200",              brand: "Fuji",           name: "C200",           nickname: "Fuji C200",                      iso: 200, color: true,  show_iso: false, gradient_from: "#4ade80", gradient_to: "#16a34a" },
  { slug: "fuji-superia-200",       brand: "Fuji",           name: "Superia",        nickname: "Fuji Superia 200",               iso: 200, color: true,  show_iso: true,  gradient_from: "#4ade80", gradient_to: "#16a34a" },
  { slug: "fuji-superia-400",       brand: "Fuji",           name: "Superia",        nickname: "Fuji Superia 400",               iso: 400, color: true,  show_iso: true,  gradient_from: "#22c55e", gradient_to: "#15803d" },
  { slug: "gold-200",               brand: "Kodak",          name: "Gold",           nickname: "Kodak Gold 200",                 iso: 200, color: true,  show_iso: false, gradient_from: "#fbbf24", gradient_to: "#f59e0b" },
  { slug: "ilford-hp5",             brand: "Ilford",         name: "HP5",            nickname: "Ilford HP5+",                    iso: 400, color: false, show_iso: false, gradient_from: "#4ade80", gradient_to: "#e4e4e7" },
  { slug: "kentmere-100",           brand: "Kentmere",       name: "Pan",            nickname: "Kentmere Pan 100",               iso: 100, color: false, show_iso: true,  gradient_from: "#60a5fa", gradient_to: "#93c5fd" },
  { slug: "kentmere-400",           brand: "Kentmere",       name: "Pan",            nickname: "Kentmere Pan 400",               iso: 400, color: false, show_iso: true,  gradient_from: "#7c3aed", gradient_to: "#ec4899" },
  { slug: "kiro-400",               brand: "Film Never Die", name: "Kiro",           nickname: "Film Never Die Kiro 400",        iso: 400, color: true,  show_iso: true,  gradient_from: "#f472b6", gradient_to: "#ec4899" },
  { slug: "lomo-400",               brand: "Lomography",     name: "Color Negative", nickname: "Lomography Color Negative 400",  iso: 400, color: true,  show_iso: true,  gradient_from: "#22d3ee", gradient_to: "#06b6d4" },
  { slug: "lomo-800",               brand: "Lomography",     name: "Color Negative", nickname: "Lomography Color Negative 800",  iso: 800, color: true,  show_iso: true,  gradient_from: "#c084fc", gradient_to: "#a855f7" },
  { slug: "portra-160",             brand: "Kodak",          name: "Portra",         nickname: "Kodak Portra 160",               iso: 160, color: true,  show_iso: true,  gradient_from: "#fed7aa", gradient_to: "#fdba74" },
  { slug: "portra-400",             brand: "Kodak",          name: "Portra",         nickname: "Kodak Portra 400",               iso: 400, color: true,  show_iso: true,  gradient_from: "#fdba74", gradient_to: "#fb923c" },
  { slug: "portra-800",             brand: "Kodak",          name: "Portra",         nickname: "Kodak Portra 800",               iso: 800, color: true,  show_iso: true,  gradient_from: "#fb923c", gradient_to: "#f97316" },
  { slug: "psych-blue",             brand: "Psych",          name: "Blue",           nickname: "Psych Blue",                     iso: 0,   color: true,  show_iso: false, gradient_from: "#818cf8", gradient_to: "#6366f1" },
  { slug: "redscale-50",            brand: "Lomography",     name: "Redscale",       nickname: "Lomography Redscale 50",         iso: 50,  color: true,  show_iso: true,  gradient_from: "#f97316", gradient_to: "#dc2626" },
  { slug: "rollei-400s",            brand: "Rollei",         name: "Retro 400S",     nickname: "Rollei Retro 400S",              iso: 400, color: false, show_iso: false, gradient_from: "#78716c", gradient_to: "#57534e" },
  { slug: "rollei-superpan-200",    brand: "Rollei",         name: "Superpan 200",   nickname: "Rollei Superpan 200",            iso: 200, color: false, show_iso: false, gradient_from: "#64748b", gradient_to: "#475569" },
  { slug: "sensia-50",              brand: "Fuji",           name: "Sensia",         nickname: "Fuji Sensia 50",                 iso: 50,  color: true,  show_iso: true,  gradient_from: "#16a34a", gradient_to: "#3b82f6" },
  { slug: "sora-200",               brand: "Film Never Die", name: "Sora",           nickname: "Film Never Die Sora 200",        iso: 200, color: true,  show_iso: true,  gradient_from: "#38bdf8", gradient_to: "#0ea5e9" },
  { slug: "trix-400",               brand: "Kodak",          name: "Tri-X",          nickname: "Kodak Tri-X 400",                iso: 400, color: false, show_iso: false, gradient_from: "#3f3f46", gradient_to: "#18181b" },
  { slug: "ultramax",               brand: "Kodak",          name: "Ultramax",       nickname: "Kodak Ultramax 400",             iso: 400, color: true,  show_iso: false, gradient_from: "#ffd700", gradient_to: "#2563eb" },
  { slug: "vision3-250d",           brand: "Kodak",          name: "Vision3 250D",   nickname: "Kodak Vision3 250D",             iso: 250, color: true,  show_iso: false, gradient_from: "#fbbf24", gradient_to: "#1c1917" },
  { slug: "xpro-200",               brand: "Lomography",     name: "X-Pro",          nickname: "Lomography X-Pro 200",           iso: 200, color: true,  show_iso: true,  gradient_from: "#fb923c", gradient_to: "#f97316" },
];

export async function POST() {
  await sql`
    CREATE TABLE IF NOT EXISTS catalog_films (
      slug          TEXT PRIMARY KEY,
      brand         TEXT NOT NULL,
      name          TEXT NOT NULL,
      nickname      TEXT,
      iso           INT,
      color         BOOLEAN DEFAULT true,
      show_iso      BOOLEAN DEFAULT false,
      gradient_from TEXT,
      gradient_to   TEXT
    )
  `;

  // Add gradient columns if table already exists without them
  await sql`ALTER TABLE catalog_films ADD COLUMN IF NOT EXISTS gradient_from TEXT`;
  await sql`ALTER TABLE catalog_films ADD COLUMN IF NOT EXISTS gradient_to   TEXT`;

  for (const f of CATALOG) {
    await sql`
      INSERT INTO catalog_films (slug, brand, name, nickname, iso, color, show_iso, gradient_from, gradient_to)
      VALUES (${f.slug}, ${f.brand}, ${f.name}, ${f.nickname}, ${f.iso}, ${f.color}, ${f.show_iso}, ${f.gradient_from}, ${f.gradient_to})
      ON CONFLICT (slug) DO UPDATE SET
        brand         = EXCLUDED.brand,
        name          = EXCLUDED.name,
        nickname      = EXCLUDED.nickname,
        iso           = EXCLUDED.iso,
        color         = EXCLUDED.color,
        show_iso      = EXCLUDED.show_iso,
        gradient_from = EXCLUDED.gradient_from,
        gradient_to   = EXCLUDED.gradient_to
    `;
  }

  return NextResponse.json({ seeded: CATALOG.length });
}
