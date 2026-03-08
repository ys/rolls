import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { Roll } from "@/lib/db";
import type postgres from "postgres";
import { getUserId } from "@/lib/request-context";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const { id: roll_number } = await params;
  const rows = await sql<Roll[]>`
    SELECT * FROM rolls WHERE roll_number = ${roll_number} AND user_id = ${userId}
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(rows[0]);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const { id: roll_number } = await params;
  const body = await request.json();

  // Resolve camera_id and film_id slugs to UUIDs if provided
  if ("camera_id" in body && body.camera_id) {
    const [cam] = await sql<{ uuid: string }[]>`
      SELECT uuid FROM cameras WHERE slug = ${body.camera_id} AND user_id = ${userId}
    `;
    body.camera_uuid = cam?.uuid ?? null;
    delete body.camera_id;
  }

  if ("film_id" in body && body.film_id) {
    const [film] = await sql<{ uuid: string }[]>`
      SELECT uuid FROM films WHERE slug = ${body.film_id} AND user_id = ${userId}
    `;
    body.film_uuid = film?.uuid ?? null;
    delete body.film_id;
  }

  const allowed = [
    "camera_uuid", "film_uuid", "shot_at", "fridge_at", "lab_at", "lab_name",
    "scanned_at", "processed_at", "uploaded_at", "archived_at",
    "album_name", "tags", "notes", "push_pull",
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

  values.push(userId);
  values.push(roll_number);
  const query = `UPDATE rolls SET ${sets.join(", ")} WHERE user_id = $${idx} AND roll_number = $${idx + 1} RETURNING *`;
  const rows = (await sql.unsafe(query, values as postgres.Parameter<never>[])) as unknown as Roll[];

  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(rows[0]);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const { id: roll_number } = await params;
  const rows = await sql`
    DELETE FROM rolls WHERE roll_number = ${roll_number} AND user_id = ${userId} RETURNING roll_number
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
