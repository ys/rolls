import { NextResponse } from "next/server";
import { getUserId, requireAdmin } from "@/lib/request-context";
import { sql } from "@/lib/db";

// One-time endpoint: assign all NULL user_id rows to the current admin user,
// then enforce NOT NULL constraints. Safe to call multiple times (idempotent).
export async function POST() {
  try {
    await requireAdmin();
    const userId = await getUserId();

    const [{ count: camerasSeeded }] = await sql<{ count: string }[]>`
      WITH updated AS (UPDATE cameras SET user_id = ${userId} WHERE user_id IS NULL RETURNING id)
      SELECT COUNT(*) as count FROM updated
    `;
    const [{ count: filmsSeeded }] = await sql<{ count: string }[]>`
      WITH updated AS (UPDATE films SET user_id = ${userId} WHERE user_id IS NULL RETURNING id)
      SELECT COUNT(*) as count FROM updated
    `;
    const [{ count: rollsSeeded }] = await sql<{ count: string }[]>`
      WITH updated AS (UPDATE rolls SET user_id = ${userId} WHERE user_id IS NULL RETURNING id)
      SELECT COUNT(*) as count FROM updated
    `;

    // Enforce NOT NULL now that all rows are assigned (no-op if already set)
    await sql`ALTER TABLE cameras ALTER COLUMN user_id SET NOT NULL`;
    await sql`ALTER TABLE films ALTER COLUMN user_id SET NOT NULL`;
    await sql`ALTER TABLE rolls ALTER COLUMN user_id SET NOT NULL`;

    return NextResponse.json({
      seeded: {
        cameras: parseInt(camerasSeeded),
        films: parseInt(filmsSeeded),
        rolls: parseInt(rollsSeeded),
      },
      message: "Existing data assigned to admin user and NOT NULL enforced",
    });
  } catch (error: any) {
    console.error("Seed existing data error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
