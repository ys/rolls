import { getUser } from "@/lib/request-context";
import { getCameraCount, getFilmCount } from "@/lib/queries";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

export const dynamic = "force-dynamic";

function Section({ label, children, mt }: { label: string; children: React.ReactNode; mt?: boolean }) {
  return (
    <div style={{ borderTop: "1px solid var(--border)", marginTop: mt ? 8 : 0 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-tertiary)", padding: "12px 20px 6px" }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Row({ href, label, value, amber }: { href: string; label: string; value: string; amber?: boolean }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 20px", borderBottom: "1px solid var(--border-subtle)",
        textDecoration: "none",
      }}
    >
      <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{label}</span>
      <span style={{ fontSize: 11, color: amber ? "var(--accent)" : "var(--text-tertiary)" }}>{value}</span>
    </Link>
  );
}

export default async function SettingsPage() {
  const { id: userId, email, role } = await getUser();

  const [camera_count, film_count] = await Promise.all([
    getCameraCount(userId),
    getFilmCount(userId),
  ]);

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: "16px 20px 12px" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-primary)" }}>···</span>
      </div>

      {/* Account */}
      <Section label="Account">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
          <span style={{ fontSize: 13, color: "var(--text-primary)" }}>Email</span>
          <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{email}</span>
        </div>
        <Row href="/settings/passkeys" label="Passkeys" value="Manage →" amber />
        <Row href="/settings/api-keys" label="API Keys" value="Manage →" amber />
      </Section>

      {/* Gear */}
      <Section label="Gear" mt>
        <Row href="/cameras" label="Cameras" value={`${camera_count} camera${camera_count !== 1 ? "s" : ""} →`} />
        <Row href="/films" label="Films" value={`${film_count} film${film_count !== 1 ? "s" : ""} →`} />
        <Row href="/invites" label="Invitations" value="Manage →" amber />
      </Section>

      {/* Admin (if applicable) */}
      {role === "admin" && (
        <Section label="Admin" mt>
          <Row href="/settings/admin" label="Dashboard" value="→" amber />
          <Row href="/settings/admin/users" label="Users" value="→" amber />
        </Section>
      )}

      {/* Data */}
      <Section label="Data" mt>
        <Row href="/api/export" label="Export" value="Download →" amber />
      </Section>

      {/* Sign out */}
      <div style={{ padding: "24px 20px" }}>
        <SignOutButton />
      </div>
    </div>
  );
}
