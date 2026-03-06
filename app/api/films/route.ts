import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { Film } from "@/lib/db";
import { getUserId } from "@/lib/request-context";

export async function GET() {
  const userId = await getUserId();
  const rows = await sql<Film[]>`
    SELECT f.*, COUNT(r.roll_number)::int AS roll_count
    FROM films f
    LEFT JOIN rolls r ON r.film_id = f.id AND r.user_id = ${userId}
    WHERE f.user_id = ${userId}
    GROUP BY f.id
    ORDER BY COALESCE(f.nickname, f.brand || ' ' || f.name)
  `;
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  const body = await request.json();
  const { id, brand, name, nickname, iso, color, show_iso } = body;

  if (!id || !brand || !name) {
    return NextResponse.json({ error: "id, brand, name are required" }, { status: 400 });
  }

  const rows = await sql<Film[]>`
    INSERT INTO films (id, user_id, brand, name, nickname, iso, color, show_iso)
    VALUES (${id}, ${userId}, ${brand}, ${name}, ${nickname ?? null}, ${iso ?? null}, ${color ?? true}, ${show_iso ?? false})
    ON CONFLICT (id, user_id) DO UPDATE SET brand = EXCLUDED.brand, name = EXCLUDED.name, nickname = EXCLUDED.nickname, iso = EXCLUDED.iso, color = EXCLUDED.color, show_iso = EXCLUDED.show_iso
    RETURNING *
  `;
  return NextResponse.json(rows[0], { status: 201 });
}
