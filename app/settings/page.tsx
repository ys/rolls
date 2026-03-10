import { getUser } from "@/lib/request-context";
import { getCameraCount, getFilmCount, getRemainingInvites } from "@/lib/queries";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

const Chevron = () => (
  <svg
    className="w-4 h-4 text-zinc-300 dark:text-zinc-600 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

function SettingsGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-1 mb-2">
        {label}
      </p>
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900">
        {children}
      </ul>
    </section>
  );
}

function SettingsRow({
  href,
  label,
  value,
}: {
  href: string;
  label: string;
  value?: string | number | null;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center justify-between px-4 py-3.5 active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors"
      >
        <span className="text-[15px]">{label}</span>
        <div className="flex items-center gap-2">
          {value !== undefined && value !== null && (
            <span className="text-[15px] text-zinc-400 dark:text-zinc-500 tabular-nums">
              {value}
            </span>
          )}
          {value === null && (
            <span className="text-[15px] text-zinc-400 dark:text-zinc-500">∞</span>
          )}
          <Chevron />
        </div>
      </Link>
    </li>
  );
}

export default async function SettingsPage() {
  const { id: userId, role } = await getUser();

  const [camera_count, film_count, remaining_invites] = await Promise.all([
    getCameraCount(userId),
    getFilmCount(userId),
    getRemainingInvites(userId),
  ]);

  return (
    <div className="space-y-6">
      <BackButton />
      <h1 className="text-3xl font-bold">Settings</h1>

      <SettingsGroup label="Library">
        <SettingsRow href="/cameras" label="Cameras" value={camera_count} />
        <SettingsRow href="/films" label="Films" value={film_count} />
        <SettingsRow href="/invites" label="Invitations" value={remaining_invites} />
      </SettingsGroup>

      {role === "admin" && (
        <SettingsGroup label="Admin">
          <SettingsRow href="/settings/admin" label="Dashboard" />
          <SettingsRow href="/settings/admin/users" label="Users" />
          <SettingsRow href="/settings/admin/catalog-films" label="Catalog Films" />
        </SettingsGroup>
      )}

      <SettingsGroup label="Developer">
        <SettingsRow href="/settings/api-keys" label="API Keys" />
      </SettingsGroup>

      <SettingsGroup label="Data">
        <SettingsRow href="/api/export" label="Export JSON" />
      </SettingsGroup>

      <SettingsGroup label="Account">
        <LogoutButton />
      </SettingsGroup>
    </div>
  );
}
