import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { Film } from "@/lib/db";

export async function GET() {
  const rows = await sql<Film[]>`SELECT * FROM films ORDER BY COALESCE(nickname, brand || ' ' || name)`;
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, brand, name, nickname, iso, color, show_iso } = body;

  if (!id || !brand || !name) {
    return NextResponse.json({ error: "id, brand, name are required" }, { status: 400 });
  }

  const rows = await sql<Film[]>`
    INSERT INTO films (id, brand, name, nickname, iso, color, show_iso)
    VALUES (${id}, ${brand}, ${name}, ${nickname ?? null}, ${iso ?? null}, ${color ?? true}, ${show_iso ?? false})
    ON CONFLICT (id) DO UPDATE SET brand = EXCLUDED.brand, name = EXCLUDED.name, nickname = EXCLUDED.nickname, iso = EXCLUDED.iso, color = EXCLUDED.color, show_iso = EXCLUDED.show_iso
    RETURNING *
  `;
  return NextResponse.json(rows[0], { status: 201 });
}
