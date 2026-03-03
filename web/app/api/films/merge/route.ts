import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { target_id, source_ids } = await request.json();

  if (!target_id || !Array.isArray(source_ids) || source_ids.length === 0) {
    return NextResponse.json({ error: "target_id and source_ids are required" }, { status: 400 });
  }

  const sources = (source_ids as string[]).filter((id) => id !== target_id);
  if (sources.length === 0) {
    return NextResponse.json({ error: "No sources to merge (all IDs equal target)" }, { status: 400 });
  }

  // Reassign rolls from source films to target
  await sql`UPDATE rolls SET film_id = ${target_id} WHERE film_id = ANY(${sources})`;

  // Delete source films
  await sql`DELETE FROM films WHERE id = ANY(${sources})`;

  return NextResponse.json({ merged: sources.length, into: target_id });
}
