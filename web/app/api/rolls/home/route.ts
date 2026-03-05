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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year");

  const currentYear = new Date().getFullYear();
  const viewYear = yearParam ? parseInt(yearParam, 10) : null;
  const isPastYear = viewYear !== null && viewYear < currentYear;

  let rolls: RollRow[];

  if (isPastYear && viewYear) {
    // Past year view
    const yearPrefix = String(viewYear).slice(2);
    const yearStart = `${viewYear}-01-01`;
    const yearEnd = `${viewYear + 1}-01-01`;

    rolls = await sql<RollRow[]>`
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
      WHERE r.archived_at IS NULL
        AND (
          r.roll_number ILIKE ${yearPrefix + "x%"}
          OR (r.shot_at >= ${yearStart} AND r.shot_at < ${yearEnd})
        )
      ORDER BY r.roll_number DESC
    `;
  } else {
    // Current year view
    const yearPrefix = String(currentYear).slice(2);
    const yearStart = `${currentYear}-01-01`;
    const yearEnd = `${currentYear + 1}-01-01`;

    rolls = await sql<RollRow[]>`
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
      WHERE r.archived_at IS NULL
        AND (
          r.scanned_at IS NULL
          OR r.roll_number ILIKE ${yearPrefix + "x%"}
          OR (r.shot_at >= ${yearStart} AND r.shot_at < ${yearEnd})
        )
      ORDER BY r.roll_number DESC
    `;
  }

  return NextResponse.json({ rolls, currentYear, viewYear });
}
