import { redirect } from "next/navigation";
import { getUser } from "@/lib/request-context";
import { sql } from "@/lib/db";
import BackButton from "@/components/BackButton";

export const dynamic = "force-dynamic";

async function getStats() {
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
  return {
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
  };
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl px-4 py-4">
      <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">{label}</p>
      <p className="text-3xl font-bold tabular-nums">{value}</p>
      {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default async function AdminPage() {
  const { role } = await getUser();
  if (role !== "admin") redirect("/settings");

  const stats = await getStats();

  return (
    <div className="space-y-8">
      <BackButton />
      <h1 className="text-3xl font-bold">Admin</h1>

      <section className="space-y-2">
        <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-1">
          Users
        </p>
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Total" value={stats.users.total} />
          <StatCard label="This week" value={stats.users.week} />
          <StatCard label="This month" value={stats.users.month} />
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-1">
          Rolls
        </p>
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Total" value={stats.rolls.total} />
          <StatCard label="This week" value={stats.rolls.week} />
          <StatCard label="This month" value={stats.rolls.month} />
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-1">
          Engagement
        </p>
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Active (30d)" value={stats.active_users_30d} sub="seen in last 30 days" />
        </div>
      </section>
    </div>
  );
}
