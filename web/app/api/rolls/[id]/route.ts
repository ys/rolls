import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { Roll } from "@/lib/db";
import type postgres from "postgres";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rows = await sql`SELECT * FROM rolls WHERE roll_number = ${id}`;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(rows[0] as Roll);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const allowed = [
    "camera_id", "film_id", "shot_at", "fridge_at", "lab_at", "lab_name",
    "scanned_at", "processed_at", "uploaded_at", "archived_at",
    "album_name", "tags", "notes",
  ] as const;

  const sets: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const key of allowed) {
    if (key in body) {
      sets.push(`${key} = $${idx}`);
      values.push(body[key]);
      idx++;
    }
  }

  if (sets.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  values.push(id);
  const query = `UPDATE rolls SET ${sets.join(", ")} WHERE roll_number = $${idx} RETURNING *`;
  const rows = await sql.unsafe(query, values as postgres.Parameter<never>[]);

  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(rows[0] as Roll);
}
