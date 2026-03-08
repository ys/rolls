import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUserId } from "@/lib/request-context";

export async function GET() {
  const userId = await getUserId();

  const [cameras, films, rolls] = await Promise.all([
    sql`SELECT uuid, slug AS id, brand, model, nickname, format FROM cameras WHERE user_id = ${userId} ORDER BY slug`,
    sql`SELECT uuid, slug AS id, brand, name, nickname, iso, color, show_iso FROM films WHERE user_id = ${userId} ORDER BY slug`,
    sql`
      SELECT
        r.roll_number, r.shot_at, r.fridge_at, r.lab_at, r.lab_name,
        r.scanned_at, r.processed_at, r.uploaded_at, r.archived_at,
        r.album_name, r.tags, r.notes, r.contact_sheet_url, r.push_pull,
        c.slug AS camera_id,
        f.slug AS film_id
      FROM rolls r
      LEFT JOIN cameras c ON c.uuid = r.camera_uuid
      LEFT JOIN films   f ON f.uuid = r.film_uuid
      WHERE r.user_id = ${userId}
      ORDER BY r.roll_number DESC
    `,
  ]);

  return NextResponse.json({ cameras, films, rolls });
}
