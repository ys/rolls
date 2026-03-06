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

  // Verify all films belong to the user
  const verifyResult = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int as count
    FROM films
    WHERE id = ANY(${[target_id, ...sources]}) AND user_id = ${userId}
  `;

  if (verifyResult[0].count !== sources.length + 1) {
    return NextResponse.json({ error: "One or more films not found" }, { status: 404 });
  }

  // Reassign rolls from source films to target (only user's rolls)
  await sql`
    UPDATE rolls
    SET film_id = ${target_id}
    WHERE film_id = ANY(${sources}) AND user_id = ${userId}
  `;

  // Delete source films (only user's films)
  await sql`
    DELETE FROM films
    WHERE id = ANY(${sources}) AND user_id = ${userId}
  `;

  return NextResponse.json({ merged: sources.length, into: target_id });
}
