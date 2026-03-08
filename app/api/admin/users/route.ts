import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/request-context";

export async function GET(request: NextRequest) {
  await requireAdmin();

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = 20;
  const offset = (page - 1) * limit;

  const [{ total }] = await sql<{ total: string }[]>`
    SELECT COUNT(*) AS total FROM users
  `;

  const users = await sql<{
    id: string;
    email: string;
    name: string | null;
    role: string;
    created_at: string;
    last_seen_at: string | null;
    roll_count: string;
  }[]>`
    SELECT
      u.id,
      u.email,
      u.name,
      u.role,
      u.created_at,
      u.last_seen_at,
      COUNT(r.roll_number) AS roll_count
    FROM users u
    LEFT JOIN rolls r ON r.user_id = u.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const totalCount = Number(total);

  return NextResponse.json({
    users: users.map((u) => ({ ...u, roll_count: Number(u.roll_count) })),
    total: totalCount,
    page,
    pages: Math.ceil(totalCount / limit),
  });
}
