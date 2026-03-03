import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import type { Roll } from "@/lib/db";

export async function GET() {
  const rows = await sql<Roll[]>`
    SELECT * FROM rolls ORDER BY roll_number DESC
  `;
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    roll_number,
    camera_id,
    film_id,
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
  } = body;

  if (!roll_number) {
    return NextResponse.json({ error: "roll_number is required" }, { status: 400 });
  }

  const rows = await sql<Roll[]>`
    INSERT INTO rolls (roll_number, camera_id, film_id, shot_at, fridge_at, lab_at, lab_name, scanned_at, processed_at, uploaded_at, archived_at, album_name, tags, notes)
    VALUES (${roll_number}, ${camera_id ?? null}, ${film_id ?? null}, ${shot_at ?? null}, ${fridge_at ?? null}, ${lab_at ?? null}, ${lab_name ?? null}, ${scanned_at ?? null}, ${processed_at ?? null}, ${uploaded_at ?? null}, ${archived_at ?? null}, ${album_name ?? null}, ${tags ?? null}, ${notes ?? null})
    RETURNING *
  `;
  revalidatePath("/");
  return NextResponse.json(rows[0], { status: 201 });
}
