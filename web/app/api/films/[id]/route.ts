import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { Film } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rows = await sql<Film[]>`SELECT * FROM films WHERE id = ${id}`;
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { brand, name, nickname, iso, color, show_iso } = await request.json();

  if (!brand || !name) {
    return NextResponse.json({ error: "brand and name are required" }, { status: 400 });
  }

  const rows = await sql<Film[]>`
    UPDATE films
    SET brand = ${brand}, name = ${name}, nickname = ${nickname ?? null},
        iso = ${iso ?? null}, color = ${color ?? true}, show_iso = ${show_iso ?? false}
    WHERE id = ${id}
    RETURNING *
  `;
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}
