import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { Roll } from "@/lib/db";
import { getUserId } from "@/lib/request-context";
import type { CreateRollBody } from "@/app/api/_schemas/rolls";
import { getRolls, getRollByUuid } from "@/lib/queries";

/**
 * List rolls
 * @description Returns rolls for the authenticated user, ordered by roll_number desc. Supports ?limit and ?offset for pagination.
 * @auth bearer
 * @response Roll[]
 * @openapi
 */
export async function GET(request: NextRequest) {
  const userId = await getUserId();
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "200", 10), 200);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  const rows = await getRolls(userId, limit, offset);
  return NextResponse.json(rows, {
    headers: { "Cache-Control": "private, max-age=60" },
  });
}

/**
 * Create a roll
 * @description Creates a new roll for the authenticated user. camera_id and film_id are slugs.
 * @auth bearer
 * @body CreateRollBody
 * @response 201:Roll
 * @openapi
 */
export async function POST(request: NextRequest) {
  const userId = await getUserId();
  const body: CreateRollBody = await request.json();
  const {
    roll_number,
    camera_uuid,
    film_uuid,
    shot_at,
    fridge_at,
    lab_at,
    lab_name,
    scanned_at,
    processed_at,
    uploaded_at,
    archived_at,
    album_name,
    tags,
    notes,
    push_pull,
  } = body;

  if (!roll_number) {
    return NextResponse.json({ error: "roll_number is required" }, { status: 400 });
  }

  const [inserted] = await sql<{ uuid: string }[]>`
    INSERT INTO rolls (roll_number, user_id, camera_uuid, film_uuid, shot_at, fridge_at, lab_at, lab_name, scanned_at, processed_at, uploaded_at, archived_at, album_name, tags, notes, push_pull)
    VALUES (${roll_number}, ${userId}, ${camera_uuid ?? null}, ${film_uuid ?? null}, ${shot_at ?? null}, ${fridge_at ?? null}, ${lab_at ?? null}, ${lab_name ?? null}, ${scanned_at ?? null}, ${processed_at ?? null}, ${uploaded_at ?? null}, ${archived_at ?? null}, ${album_name ?? null}, ${tags ?? null}, ${notes ?? null}, ${push_pull ?? null})
    RETURNING uuid
  `;
  const roll = await getRollByUuid(userId, inserted.uuid);
  return NextResponse.json(roll, { status: 201 });
}
