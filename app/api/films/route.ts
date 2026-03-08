import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { Film } from "@/lib/db";
import { getUserId } from "@/lib/request-context";
import { getFilms } from "@/lib/queries";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET() {
  const userId = await getUserId();
  const rows = await getFilms(userId);
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  const body = await request.json();
  const { brand, name, nickname, iso, color, show_iso } = body;

  if (!brand || !name) {
    return NextResponse.json({ error: "brand, name are required" }, { status: 400 });
  }

  // Generate slug server-side
  const slug = slugify(`${brand}-${name}`);

  const rows = await sql<Film[]>`
    INSERT INTO films (slug, user_id, brand, name, nickname, iso, color, show_iso)
    VALUES (${slug}, ${userId}, ${brand}, ${name}, ${nickname ?? null}, ${iso ?? null}, ${color ?? true}, ${show_iso ?? false})
    ON CONFLICT (user_id, slug) DO UPDATE SET brand = EXCLUDED.brand, name = EXCLUDED.name, nickname = EXCLUDED.nickname, iso = EXCLUDED.iso, color = EXCLUDED.color, show_iso = EXCLUDED.show_iso
    RETURNING *
  `;
  return NextResponse.json(rows[0], { status: 201 });
}
