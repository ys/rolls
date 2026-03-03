import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { Camera } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rows = await sql`SELECT * FROM cameras WHERE id = ${id}`;
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0] as unknown as Camera);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { brand, model, nickname, format } = await request.json();

  if (!brand || !model) {
    return NextResponse.json({ error: "brand and model are required" }, { status: 400 });
  }

  const rows = await sql`
    UPDATE cameras
    SET brand = ${brand}, model = ${model}, nickname = ${nickname ?? null}, format = ${format ?? 135}
    WHERE id = ${id}
    RETURNING *
  `;
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0] as unknown as Camera);
}
