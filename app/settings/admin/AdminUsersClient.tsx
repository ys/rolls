"use client";

import { useState } from "react";

type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
  last_seen_at: string | null;
  roll_count: number;
};

type UsersData = {
  users: AdminUser[];
  total: number;
  page: number;
  pages: number;
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export default function AdminUsersClient({ initialData }: { initialData: UsersData }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  async function goToPage(page: number) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?page=${page}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
        {data.users.map((user) => (
          <div key={user.id} className="px-4 py-3 flex items-center justify-between gap-3 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[15px] truncate">{user.email}</p>
                {user.role === "admin" && (
                  <span className="text-[10px] uppercase tracking-widest border px-1.5 py-0.5 rounded shrink-0" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                    admin
                  </span>
                )}
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                Joined {formatDate(user.created_at)} · Last seen {formatRelative(user.last_seen_at)}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[15px] tabular-nums font-medium">{user.roll_count}</p>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>rolls</p>
            </div>
          </div>
        ))}
      </div>

      {data.pages > 1 && (
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => goToPage(data.page - 1)}
            disabled={data.page <= 1 || loading}
            className="text-sm disabled:opacity-30 transition-opacity"
            style={{ color: "var(--text-secondary)" }}
          >
            ← Previous
          </button>
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {data.page} / {data.pages}
          </span>
          <button
            onClick={() => goToPage(data.page + 1)}
            disabled={data.page >= data.pages || loading}
            className="text-sm disabled:opacity-30 transition-opacity"
            style={{ color: "var(--text-secondary)" }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
