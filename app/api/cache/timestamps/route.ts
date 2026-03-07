import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

/**
 * Returns the latest updated_at timestamp for each table
 * Used for cache invalidation checks
 */
export async function GET() {
  try {
    const [camerasResult, filmsResult, rollsResult] = await Promise.all([
      sql<{ updated_at: string }[]>`
        SELECT MAX(updated_at) as updated_at FROM cameras
      `,
      sql<{ updated_at: string }[]>`
        SELECT MAX(updated_at) as updated_at FROM films
      `,
      sql<{ updated_at: string }[]>`
        SELECT MAX(updated_at) as updated_at FROM rolls
      `,
    ]);

    return NextResponse.json({
      cameras: camerasResult[0]?.updated_at || null,
      films: filmsResult[0]?.updated_at || null,
      rolls: rollsResult[0]?.updated_at || null,
    });
  } catch (error) {
    console.error("Failed to fetch timestamps:", error);
    return NextResponse.json(
      { error: "Failed to fetch timestamps" },
      { status: 500 }
    );
  }
}
