import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// One-time migration: for rolls that have archived_at but no scanned_at,
// set scanned_at = COALESCE(processed_at, archived_at).
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const apiKey = process.env.API_KEY;
  if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updated = await sql<{ roll_number: string; scanned_at: string }[]>`
    UPDATE rolls
    SET scanned_at = COALESCE(processed_at, archived_at)
    WHERE archived_at IS NOT NULL AND scanned_at IS NULL
    RETURNING roll_number, scanned_at
  `;

  return NextResponse.json({ updated: updated.length, rolls: updated });
}
