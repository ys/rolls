import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const apiKey = process.env.API_KEY;
  if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updated = await sql<{ roll_number: string }[]>`
    UPDATE rolls
    SET contact_sheet_url = REPLACE(contact_sheet_url, 'rolls.b.yannick.computer', 'rolls-b.yannick.computer')
    WHERE contact_sheet_url LIKE '%rolls.b.yannick.computer%'
    RETURNING roll_number
  `;

  return NextResponse.json({ updated: updated.length });
}
