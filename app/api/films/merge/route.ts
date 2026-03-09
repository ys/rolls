import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUserId } from "@/lib/request-context";

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  const { target_id, source_ids } = await request.json();

  if (!target_id || !Array.isArray(source_ids) || source_ids.length === 0) {
    return NextResponse.json({ error: "target_id and source_ids are required" }, { status: 400 });
  }

  const sources = (source_ids as string[]).filter((id) => id !== target_id);
  if (sources.length === 0) {
    return NextResponse.json({ error: "No sources to merge (all IDs equal target)" }, { status: 400 });
  }

  // Look up UUIDs for target and source films
  const filmRows = await sql<{ slug: string; uuid: string }[]>`
    SELECT slug, uuid FROM films
    WHERE slug = ANY(${[target_id, ...sources]}) AND user_id = ${userId}
  `;
  const uuidBySlug = new Map(filmRows.map((f) => [f.slug, f.uuid]));
  const targetUuid = uuidBySlug.get(target_id);
  const sourceUuids = sources.map((s) => uuidBySlug.get(s)).filter(Boolean) as string[];

  if (!targetUuid || sourceUuids.length !== sources.length) {
    return NextResponse.json({ error: "One or more films not found" }, { status: 404 });
  }

  // Reassign rolls from source films to target (only user's rolls)
  await sql`
    UPDATE rolls
    SET film_uuid = ${targetUuid}
    WHERE film_uuid = ANY(${sourceUuids}) AND user_id = ${userId}
  `;

  // Delete source films (only user's films)
  await sql`
    DELETE FROM films
    WHERE uuid = ANY(${sourceUuids}) AND user_id = ${userId}
  `;

  return NextResponse.json({ merged: sources.length, into: target_id });
}
