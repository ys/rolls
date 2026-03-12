import { getUser } from "@/lib/request-context";
import { getCameraCount, getFilmCount, getRemainingInvites } from "@/lib/queries";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

const Chevron = () => (
  <svg
    className="w-4 h-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    style={{ color: "var(--darkroom-text-tertiary)" }}
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
      <p className="text-[11px] font-semibold uppercase tracking-wider px-4 mb-3" style={{ color: "var(--darkroom-text-secondary)" }}>
        {label}
      </p>
      <ul className="border-t" style={{ borderColor: "var(--darkroom-border)" }}>
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
        className="flex items-center justify-between px-4 py-3.5 border-b active:bg-zinc-900/30 transition-colors"
        style={{ borderColor: "var(--darkroom-border)" }}
      >
        <span className="text-xs" style={{ color: "var(--darkroom-text-primary)" }}>{label}</span>
        <div className="flex items-center gap-2">
          {value !== undefined && value !== null && (
            <span className="text-xs tabular-nums" style={{ color: "var(--darkroom-text-tertiary)" }}>
              {value}
            </span>
          )}
          {value === null && (
            <span className="text-xs" style={{ color: "var(--darkroom-text-tertiary)" }}>∞</span>
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
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between px-4 py-4 border-b mb-6" style={{ borderColor: "var(--darkroom-border)" }}>
        <BackButton />
        <h1 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--darkroom-text-primary)" }}>
          SETTINGS
        </h1>
        <div className="w-8" />
      </div>

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
