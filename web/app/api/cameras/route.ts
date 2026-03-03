import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { Camera } from "@/lib/db";

export async function GET() {
  const rows = await sql<Camera[]>`
    SELECT c.*, COUNT(r.roll_number)::int AS roll_count
    FROM cameras c
    LEFT JOIN rolls r ON r.camera_id = c.id
    GROUP BY c.id
    ORDER BY COALESCE(c.nickname, c.brand || ' ' || c.model)
  `;
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, brand, model, nickname, format } = body;

  if (!id || !brand || !model) {
    return NextResponse.json({ error: "id, brand, model are required" }, { status: 400 });
  }

  const rows = await sql<Camera[]>`
    INSERT INTO cameras (id, brand, model, nickname, format)
    VALUES (${id}, ${brand}, ${model}, ${nickname ?? null}, ${format ?? 135})
    ON CONFLICT (id) DO UPDATE SET brand = EXCLUDED.brand, model = EXCLUDED.model, nickname = EXCLUDED.nickname, format = EXCLUDED.format
    RETURNING *
  `;
  return NextResponse.json(rows[0], { status: 201 });
}
