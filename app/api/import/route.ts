import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUserId } from "@/lib/request-context";

import type { ImportPayload, ImportResponse } from "@/app/api/_schemas/import_export";

/**
 * Import (upsert) cameras, films, and rolls (CLI sync)
 * @description Upserts by slug (id) for cameras/films and roll_number for rolls.
 * @auth bearer
 * @body ImportPayload
 * @response ImportResponse
 * @openapi
 */
export async function POST(request: NextRequest) {
  const userId = await getUserId();
  const body: ImportPayload = await request.json();

  const cameras = body.cameras ?? [];
  const films = body.films ?? [];
  const rolls = body.rolls ?? [];

  // Upsert cameras (CLI sends id = slug)
  for (const c of cameras) {
    if (!c.id || !c.brand || !c.model) continue;
    await sql`
      INSERT INTO cameras (slug, user_id, brand, model, nickname, format)
      VALUES (${c.id}, ${userId}, ${c.brand}, ${c.model}, ${c.nickname ?? null}, ${c.format ?? 135})
      ON CONFLICT (user_id, slug) DO UPDATE SET
        brand    = EXCLUDED.brand,
        model    = EXCLUDED.model,
        nickname = EXCLUDED.nickname,
        format   = EXCLUDED.format
    `;
  }

  // Upsert films (CLI sends id = slug)
  for (const f of films) {
    if (!f.id || !f.brand || !f.name) continue;
    await sql`
      INSERT INTO films (slug, user_id, brand, name, nickname, iso, color, show_iso)
      VALUES (${f.id}, ${userId}, ${f.brand}, ${f.name}, ${f.nickname ?? null}, ${f.iso ?? null}, ${f.color ?? true}, ${f.show_iso ?? false})
      ON CONFLICT (user_id, slug) DO UPDATE SET
        brand    = EXCLUDED.brand,
        name     = EXCLUDED.name,
        nickname = EXCLUDED.nickname,
        iso      = EXCLUDED.iso,
        color    = EXCLUDED.color,
        show_iso = EXCLUDED.show_iso
    `;
  }

  // Upsert rolls — resolve camera_id/film_id slugs to UUIDs
  for (const r of rolls) {
    if (!r.roll_number) continue;

    const [cam] = r.camera_id
      ? await sql<{ uuid: string }[]>`SELECT uuid FROM cameras WHERE slug = ${r.camera_id} AND user_id = ${userId}`
      : [];
    const [film] = r.film_id
      ? await sql<{ uuid: string }[]>`SELECT uuid FROM films WHERE slug = ${r.film_id} AND user_id = ${userId}`
      : [];

    await sql`
      INSERT INTO rolls (roll_number, user_id, camera_uuid, film_uuid, shot_at, fridge_at, lab_at, lab_name, scanned_at, processed_at, uploaded_at, archived_at, album_name, tags, notes, contact_sheet_url, push_pull)
      VALUES (
        ${r.roll_number}, ${userId},
        ${cam?.uuid ?? null}, ${film?.uuid ?? null},
        ${r.shot_at ?? null}, ${r.fridge_at ?? null}, ${r.lab_at ?? null}, ${r.lab_name ?? null},
        ${r.scanned_at ?? null}, ${r.processed_at ?? null}, ${r.uploaded_at ?? null}, ${r.archived_at ?? null},
        ${r.album_name ?? null}, ${r.tags?.filter(t => t) ?? null}, ${r.notes ?? null}, ${r.contact_sheet_url ?? null},
        ${r.push_pull ?? null}
      )
      ON CONFLICT (user_id, roll_number) DO UPDATE SET
        camera_uuid      = COALESCE(EXCLUDED.camera_uuid, rolls.camera_uuid),
        film_uuid        = COALESCE(EXCLUDED.film_uuid, rolls.film_uuid),
        shot_at          = EXCLUDED.shot_at,
        fridge_at        = EXCLUDED.fridge_at,
        lab_at           = EXCLUDED.lab_at,
        lab_name         = EXCLUDED.lab_name,
        scanned_at       = COALESCE(EXCLUDED.scanned_at, rolls.scanned_at),
        processed_at     = EXCLUDED.processed_at,
        uploaded_at      = EXCLUDED.uploaded_at,
        archived_at      = EXCLUDED.archived_at,
        album_name       = EXCLUDED.album_name,
        tags             = EXCLUDED.tags,
        notes            = EXCLUDED.notes,
        contact_sheet_url = COALESCE(EXCLUDED.contact_sheet_url, rolls.contact_sheet_url),
        push_pull        = EXCLUDED.push_pull
    `;
  }

  return NextResponse.json({
    cameras: cameras.length,
    films: films.length,
    rolls: rolls.length,
  } satisfies ImportResponse);
}
