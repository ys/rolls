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

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <li className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>{value}</span>
    </li>
  );
}

export default async function AdminPage() {
  const { role } = await getUser();
  if (role !== "admin") redirect("/settings");

  const stats = await getStats();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <BackButton />
        <h1 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>Admin</h1>
        <div className="w-8" />
      </div>

      <section className="space-y-3 px-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Users</p>
        <ul className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
          <StatRow label="Total" value={stats.users.total} />
          <StatRow label="This week" value={stats.users.week} />
          <StatRow label="This month" value={stats.users.month} />
          <StatRow label="Active (30d)" value={stats.active_users_30d} />
        </ul>
      </section>

      <section className="space-y-3 px-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Rolls</p>
        <ul className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
          <StatRow label="Total" value={stats.rolls.total} />
          <StatRow label="This week" value={stats.rolls.week} />
          <StatRow label="This month" value={stats.rolls.month} />
        </ul>
      </section>
    </div>
  );
}
