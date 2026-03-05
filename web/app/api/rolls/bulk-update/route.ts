import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

const ALLOWED_FIELDS = ["processed_at", "uploaded_at", "archived_at", "scanned_at"] as const;
type AllowedField = typeof ALLOWED_FIELDS[number];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { roll_numbers, field, value } = body as {
    roll_numbers: string[];
    field: AllowedField;
    value: string | null;
  };

  if (!Array.isArray(roll_numbers) || roll_numbers.length === 0) {
    return NextResponse.json({ error: "roll_numbers must be a non-empty array" }, { status: 400 });
  }

  if (!ALLOWED_FIELDS.includes(field)) {
    return NextResponse.json({ error: "Invalid field" }, { status: 400 });
  }

  // Use a single UPDATE with ANY for efficiency
  const v = value ?? null;
  if (field === "processed_at") {
    await sql`UPDATE rolls SET processed_at = ${v} WHERE roll_number = ANY(${roll_numbers})`;
  } else if (field === "uploaded_at") {
    await sql`UPDATE rolls SET uploaded_at = ${v} WHERE roll_number = ANY(${roll_numbers})`;
  } else if (field === "archived_at") {
    await sql`UPDATE rolls SET archived_at = ${v} WHERE roll_number = ANY(${roll_numbers})`;
  } else if (field === "scanned_at") {
    await sql`UPDATE rolls SET scanned_at = ${v} WHERE roll_number = ANY(${roll_numbers})`;
  }

  return NextResponse.json({ updated: roll_numbers.length });
}
