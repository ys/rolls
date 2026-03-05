import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { Roll } from "@/lib/db";

type RollRow = Roll & {
  camera_nickname: string | null;
  camera_brand: string | null;
  camera_model: string | null;
  film_nickname: string | null;
  film_brand: string | null;
  film_name: string | null;
  film_iso: number | null;
  film_show_iso: boolean | null;
};

export async function GET() {
  const rolls = await sql<RollRow[]>`
    SELECT r.*,
      c.nickname  AS camera_nickname,
      c.brand     AS camera_brand,
      c.model     AS camera_model,
      f.nickname  AS film_nickname,
      f.brand     AS film_brand,
      f.name      AS film_name,
      f.iso       AS film_iso,
      f.show_iso  AS film_show_iso
    FROM rolls r
    LEFT JOIN cameras c ON c.id = r.camera_id
    LEFT JOIN films   f ON f.id = r.film_id
    WHERE r.scanned_at IS NOT NULL
    ORDER BY r.scanned_at DESC, r.roll_number DESC
  `;

  return NextResponse.json({ rolls });
}
