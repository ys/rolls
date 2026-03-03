import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { sql } from "@/lib/db";

interface ImportCamera {
  id: string;
  brand: string;
  model: string;
  nickname?: string;
  format?: number;
}

interface ImportFilm {
  id: string;
  brand: string;
  name: string;
  nickname?: string;
  iso?: number;
  color?: boolean;
  show_iso?: boolean;
}

interface ImportRoll {
  roll_number: string;
  camera_id?: string;
  film_id?: string;
  shot_at?: string;
  fridge_at?: string;
  lab_at?: string;
  lab_name?: string;
  scanned_at?: string;
  processed_at?: string;
  uploaded_at?: string;
  archived_at?: string;
  album_name?: string;
  tags?: string[];
  notes?: string;
}

interface ImportPayload {
  cameras?: ImportCamera[];
  films?: ImportFilm[];
  rolls?: ImportRoll[];
}

export async function POST(request: NextRequest) {
  const body: ImportPayload = await request.json();

  const cameras = body.cameras ?? [];
  const films = body.films ?? [];
  const rolls = body.rolls ?? [];

  // Upsert cameras
  for (const c of cameras) {
    if (!c.id || !c.brand || !c.model) continue;
    await sql`
      INSERT INTO cameras (id, brand, model, nickname, format)
      VALUES (${c.id}, ${c.brand}, ${c.model}, ${c.nickname ?? null}, ${c.format ?? 135})
      ON CONFLICT (id) DO UPDATE SET
        brand    = EXCLUDED.brand,
        model    = EXCLUDED.model,
        nickname = EXCLUDED.nickname,
        format   = EXCLUDED.format
    `;
  }

  // Upsert films
  for (const f of films) {
    if (!f.id || !f.brand || !f.name) continue;
    await sql`
      INSERT INTO films (id, brand, name, nickname, iso, color, show_iso)
      VALUES (${f.id}, ${f.brand}, ${f.name}, ${f.nickname ?? null}, ${f.iso ?? null}, ${f.color ?? true}, ${f.show_iso ?? false})
      ON CONFLICT (id) DO UPDATE SET
        brand    = EXCLUDED.brand,
        name     = EXCLUDED.name,
        nickname = EXCLUDED.nickname,
        iso      = EXCLUDED.iso,
        color    = EXCLUDED.color,
        show_iso = EXCLUDED.show_iso
    `;
  }

  // Upsert rolls
  for (const r of rolls) {
    if (!r.roll_number) continue;
    await sql`
      INSERT INTO rolls (roll_number, camera_id, film_id, shot_at, fridge_at, lab_at, lab_name, scanned_at, processed_at, uploaded_at, archived_at, album_name, tags, notes)
      VALUES (
        ${r.roll_number},
        ${r.camera_id ?? null},
        ${r.film_id ?? null},
        ${r.shot_at ?? null},
        ${r.fridge_at ?? null},
        ${r.lab_at ?? null},
        ${r.lab_name ?? null},
        ${r.scanned_at ?? null},
        ${r.processed_at ?? null},
        ${r.uploaded_at ?? null},
        ${r.archived_at ?? null},
        ${r.album_name ?? null},
        ${r.tags ?? null},
        ${r.notes ?? null}
      )
      ON CONFLICT (roll_number) DO UPDATE SET
        camera_id    = EXCLUDED.camera_id,
        film_id      = EXCLUDED.film_id,
        shot_at      = EXCLUDED.shot_at,
        fridge_at    = EXCLUDED.fridge_at,
        lab_at       = EXCLUDED.lab_at,
        lab_name     = EXCLUDED.lab_name,
        scanned_at   = EXCLUDED.scanned_at,
        processed_at = EXCLUDED.processed_at,
        uploaded_at  = EXCLUDED.uploaded_at,
        archived_at  = EXCLUDED.archived_at,
        album_name   = EXCLUDED.album_name,
        tags         = EXCLUDED.tags,
        notes        = EXCLUDED.notes
    `;
  }

  revalidatePath("/");
  revalidateTag("rolls", "max");
  return NextResponse.json({
    cameras: cameras.length,
    films: films.length,
    rolls: rolls.length,
  });
}
