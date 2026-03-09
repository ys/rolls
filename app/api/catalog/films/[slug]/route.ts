import { NextResponse } from "next/server";
import { sql, type CatalogFilm } from "@/lib/db";
import { getUser } from "@/lib/request-context";

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { role } = await getUser();
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { slug } = await params;
  const body = await req.json();
  const { brand, name, nickname, iso, color, show_iso, gradient_from, gradient_to } = body;

  const [film] = await sql<CatalogFilm[]>`
    UPDATE catalog_films SET
      brand         = ${brand},
      name          = ${name},
      nickname      = ${nickname ?? null},
      iso           = ${iso ?? null},
      color         = ${color ?? true},
      show_iso      = ${show_iso ?? false},
      gradient_from = ${gradient_from ?? null},
      gradient_to   = ${gradient_to ?? null}
    WHERE slug = ${slug}
    RETURNING *
  `;
  if (!film) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(film);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { role } = await getUser();
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { slug } = await params;
  await sql`DELETE FROM catalog_films WHERE slug = ${slug}`;
  return new NextResponse(null, { status: 204 });
}
