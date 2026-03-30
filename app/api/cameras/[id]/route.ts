import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { Camera } from "@/lib/db";
import { getUserId } from "@/lib/request-context";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const { id } = await params;
  const rows = await sql<(Camera & { roll_count: number })[]>`
    SELECT c.*, COUNT(r.roll_number)::int AS roll_count
    FROM cameras c
    LEFT JOIN rolls r ON r.camera_uuid = c.uuid AND r.user_id = ${userId}
    WHERE c.uuid = ${id} AND c.user_id = ${userId}
    GROUP BY c.uuid
  `;
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const { id } = await params;

  const rows = await sql<(Camera & { roll_count: number })[]>`
    SELECT c.*, COUNT(r.roll_number)::int AS roll_count
    FROM cameras c
    LEFT JOIN rolls r ON r.camera_uuid = c.uuid AND r.user_id = ${userId}
    WHERE c.uuid = ${id} AND c.user_id = ${userId}
    GROUP BY c.uuid
  `;
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (rows[0].roll_count > 0) {
    return NextResponse.json({ error: "Cannot delete camera with rolls" }, { status: 409 });
  }

  await sql`DELETE FROM cameras WHERE uuid = ${id} AND user_id = ${userId}`;
  return new NextResponse(null, { status: 204 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const { id } = await params;
  const { brand, model, nickname, format } = await request.json();

  if (!brand || !model) {
    return NextResponse.json({ error: "brand and model are required" }, { status: 400 });
  }

  if (brand.length > 100 || model.length > 100 || (nickname && nickname.length > 100)) {
    return NextResponse.json({ error: "brand, model, and nickname must be 100 characters or fewer" }, { status: 400 });
  }

  const rows = await sql<Camera[]>`
    UPDATE cameras
    SET brand = ${brand}, model = ${model}, nickname = ${nickname ?? null}, format = ${format ?? 135}
    WHERE uuid = ${id} AND user_id = ${userId}
    RETURNING *
  `;
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}
