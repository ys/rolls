import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/request-context";

// One-time cleanup: remove stub cameras/films added by old CLI push behaviour.
// Stubs were created with model='unknown' (cameras) or name='unknown' (films).
// Rolls pointing to stubs get their camera_uuid/film_uuid nullified so a fresh
// `rolls push` can re-link them correctly.
export async function POST() {
  await requireAdmin();

  // Nullify rolls pointing to stub cameras
  const { count: cameraRollsFixed } = await sql<{ count: number }[]>`
    WITH stub_cameras AS (
      SELECT uuid FROM cameras WHERE model = 'unknown'
    )
    UPDATE rolls
    SET camera_uuid = NULL
    WHERE camera_uuid IN (SELECT uuid FROM stub_cameras)
    RETURNING 1
  `.then((rows) => ({ count: rows.length }));

  // Nullify rolls pointing to stub films
  const { count: filmRollsFixed } = await sql<{ count: number }[]>`
    WITH stub_films AS (
      SELECT uuid FROM films WHERE name = 'unknown'
    )
    UPDATE rolls
    SET film_uuid = NULL
    WHERE film_uuid IN (SELECT uuid FROM stub_films)
    RETURNING 1
  `.then((rows) => ({ count: rows.length }));

  // Delete stub cameras
  const stubCamerasDeleted = await sql<{ slug: string }[]>`
    DELETE FROM cameras WHERE model = 'unknown' RETURNING slug
  `;

  // Delete stub films
  const stubFilmsDeleted = await sql<{ slug: string }[]>`
    DELETE FROM films WHERE name = 'unknown' RETURNING slug
  `;

  return NextResponse.json({
    cameras_deleted: stubCamerasDeleted.map((c) => c.slug),
    films_deleted: stubFilmsDeleted.map((f) => f.slug),
    camera_rolls_nullified: cameraRollsFixed,
    film_rolls_nullified: filmRollsFixed,
  });
}
