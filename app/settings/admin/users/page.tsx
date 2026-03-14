import { redirect } from "next/navigation";
import { getUser } from "@/lib/request-context";
import { sql } from "@/lib/db";
import BackButton from "@/components/BackButton";
import AdminUsersClient from "../AdminUsersClient";

export const dynamic = "force-dynamic";

async function getUsers(page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const [{ total }] = await sql<{ total: string }[]>`SELECT COUNT(*) AS total FROM users`;
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
  return {
    users: users.map((u) => ({ ...u, roll_count: Number(u.roll_count) })),
    total: totalCount,
    page,
    pages: Math.ceil(totalCount / limit),
  };
}

export default async function AdminUsersPage() {
  const { role } = await getUser();
  if (role !== "admin") redirect("/settings");

  const usersData = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <BackButton />
        <h1 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>Users</h1>
        <div className="w-8" />
      </div>
      <AdminUsersClient initialData={usersData} />
    </div>
  );
}
