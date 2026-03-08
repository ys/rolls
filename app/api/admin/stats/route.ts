import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/request-context";

export async function GET() {
  await requireAdmin();

  const [row] = await sql<{
    total_users: string;
    users_week: string;
    users_month: string;
    total_rolls: string;
    rolls_week: string;
    rolls_month: string;
    active_users_30d: string;
  }[]>`
    SELECT
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '7 days') AS users_week,
      (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '30 days') AS users_month,
      (SELECT COUNT(*) FROM rolls) AS total_rolls,
      (SELECT COUNT(*) FROM rolls WHERE created_at >= NOW() - INTERVAL '7 days') AS rolls_week,
      (SELECT COUNT(*) FROM rolls WHERE created_at >= NOW() - INTERVAL '30 days') AS rolls_month,
      (SELECT COUNT(*) FROM users WHERE last_seen_at >= NOW() - INTERVAL '30 days') AS active_users_30d
  `;

  return NextResponse.json({
    users: {
      total: Number(row.total_users),
      week: Number(row.users_week),
      month: Number(row.users_month),
    },
    rolls: {
      total: Number(row.total_rolls),
      week: Number(row.rolls_week),
      month: Number(row.rolls_month),
    },
    active_users_30d: Number(row.active_users_30d),
  });
}
