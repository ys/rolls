import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Public endpoint — returns whether an invite code is required to register.
// needsInvite is false only when the users table is empty (first-run bootstrap).
export async function GET() {
  const [{ count }] = await sql<{ count: string }[]>`SELECT COUNT(*) as count FROM users`;
  return NextResponse.json({ needsInvite: parseInt(count) > 0 });
}
