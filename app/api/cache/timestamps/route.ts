import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

/**
 * Returns the latest updated_at timestamp for each table
 * Used for cache invalidation checks
 */
export async function GET() {
  try {
    const result = await sql<
      { cameras: string | null; films: string | null; rolls: string | null }[]
    >`
      SELECT
        (SELECT MAX(updated_at) FROM cameras) AS cameras,
        (SELECT MAX(updated_at) FROM films)   AS films,
        (SELECT MAX(updated_at) FROM rolls)   AS rolls
    `;

    return NextResponse.json({
      cameras: result[0]?.cameras || null,
      films: result[0]?.films || null,
      rolls: result[0]?.rolls || null,
    });
  } catch (error) {
    console.error("Failed to fetch timestamps:", error);
    return NextResponse.json(
      { error: "Failed to fetch timestamps" },
      { status: 500 }
    );
  }
}
