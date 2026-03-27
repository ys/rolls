import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { Roll } from "@/lib/db";
import type postgres from "postgres";
import { getUserId } from "@/lib/request-context";
import { getRollByUuid } from "@/lib/queries";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const { id: uuid } = await params;
  const roll = await getRollByUuid(userId, uuid);
  if (!roll) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(roll);
}

async function handleUpdate(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const { id: uuid } = await params;
  const body = await request.json();

  // Resolve camera_id and film_id slugs to UUIDs if provided
  if ("camera_id" in body) {
    if (body.camera_id) {
      const [cam] = await sql<{ uuid: string }[]>`
        SELECT uuid FROM cameras WHERE slug = ${body.camera_id} AND user_id = ${userId}
      `;
      body.camera_uuid = cam?.uuid ?? null;
    } else {
      body.camera_uuid = null;
    }
    delete body.camera_id;
  }

  if ("film_id" in body) {
    if (body.film_id) {
      const [film] = await sql<{ uuid: string }[]>`
        SELECT uuid FROM films WHERE slug = ${body.film_id} AND user_id = ${userId}
      `;
      body.film_uuid = film?.uuid ?? null;
    } else {
      body.film_uuid = null;
    }
    delete body.film_id;
  }

  const allowed = [
    "roll_number", "camera_uuid", "film_uuid", "shot_at", "fridge_at", "lab_at", "lab_name",
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
  values.push(uuid);
  const query = `UPDATE rolls SET ${sets.join(", ")} WHERE user_id = $${idx} AND uuid = $${idx + 1} RETURNING uuid`;
  const rows = (await sql.unsafe(query, values as postgres.Parameter<never>[])) as unknown as { uuid: string }[];

  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const roll = await getRollByUuid(userId, rows[0].uuid);
  return NextResponse.json(roll);
}

export const PATCH = handleUpdate;
export const PUT = handleUpdate;

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const { id: uuid } = await params;
  const rows = await sql`
    DELETE FROM rolls WHERE uuid = ${uuid} AND user_id = ${userId} RETURNING uuid
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
