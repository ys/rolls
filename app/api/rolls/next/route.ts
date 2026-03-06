import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUserId } from "@/lib/request-context";

export async function GET() {
  const userId = await getUserId();
  const year = new Date().getFullYear().toString().slice(-2);
  const prefix = `${year}x`;

  const rows = await sql<{ slug: string }[]>`
    SELECT slug FROM rolls
    WHERE user_id = ${userId} AND slug ILIKE ${prefix + "%"}
    ORDER BY slug DESC
    LIMIT 20
  `;

  const nums = rows
    .map((r) => parseInt(r.slug.slice(prefix.length), 10))
    .filter((n) => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  const roll_number = `${prefix}${String(next).padStart(2, "0")}`;

  return NextResponse.json({ roll_number });
}
