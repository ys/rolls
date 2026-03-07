import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { Camera } from "@/lib/db";
import { getUserId } from "@/lib/request-context";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const { id: slug } = await params;
  const rows = await sql<Camera[]>`
    SELECT * FROM cameras WHERE slug = ${slug} AND user_id = ${userId}
  `;
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const { id: slug } = await params;
  const { brand, model, nickname, format } = await request.json();

  if (!brand || !model) {
    return NextResponse.json({ error: "brand and model are required" }, { status: 400 });
  }

  const rows = await sql<Camera[]>`
    UPDATE cameras
    SET brand = ${brand}, model = ${model}, nickname = ${nickname ?? null}, format = ${format ?? 135}
    WHERE slug = ${slug} AND user_id = ${userId}
    RETURNING *
  `;
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}
