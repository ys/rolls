import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const apiKey = process.env.API_KEY;
  if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const r2PublicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  if (!r2PublicUrl) {
    return NextResponse.json({ error: "R2_PUBLIC_URL not set" }, { status: 500 });
  }

  // Rebuild all contact_sheet_url values using the current R2_PUBLIC_URL.
  // Strips whatever base URL was previously stored and replaces with the current one.
  const updated = await sql<{ roll_number: string }[]>`
    UPDATE rolls
    SET contact_sheet_url = ${r2PublicUrl} || '/' || roll_number || '.webp'
    WHERE contact_sheet_url IS NOT NULL
    RETURNING roll_number
  `;

  return NextResponse.json({ updated: updated.length });
}
