import { NextResponse } from "next/server";
import { sql, type CatalogFilm } from "@/lib/db";
import { getUser } from "@/lib/request-context";

export async function GET() {
  const films = await sql<CatalogFilm[]>`
    SELECT * FROM catalog_films ORDER BY brand, name, iso
  `;
  return NextResponse.json(films);
}

export async function POST(req: Request) {
  const { role } = await getUser();
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { slug, brand, name, nickname, iso, color, show_iso, gradient_from, gradient_to } = body;
  if (!slug || !brand || !name) return NextResponse.json({ error: "slug, brand, name required" }, { status: 400 });

  const [film] = await sql<CatalogFilm[]>`
    INSERT INTO catalog_films (slug, brand, name, nickname, iso, color, show_iso, gradient_from, gradient_to)
    VALUES (${slug}, ${brand}, ${name}, ${nickname ?? null}, ${iso ?? null}, ${color ?? true}, ${show_iso ?? false}, ${gradient_from ?? null}, ${gradient_to ?? null})
    RETURNING *
  `;
  return NextResponse.json(film, { status: 201 });
}
