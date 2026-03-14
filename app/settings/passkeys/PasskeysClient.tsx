"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import { haptics } from "@/lib/haptics";

interface Credential {
  id: string;
  device_name: string | null;
  created_at: string;
  last_used_at: string | null;
}

function formatDate(s: string | null): string {
  if (!s) return "Never";
  return new Date(s).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function PasskeysClient({ initialCredentials }: { initialCredentials: Credential[] }) {
  const router = useRouter();
  const [credentials, setCredentials] = useState(initialCredentials);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (credentials.length <= 1) return; // Don't delete the last passkey
    setDeletingId(id);
    const resp = await fetch(`/api/auth/credentials/${id}`, { method: "DELETE" });
    if (resp.ok) {
      setCredentials((prev) => prev.filter((c) => c.id !== id));
      haptics.success();
      router.refresh();
    } else {
      haptics.error();
    }
    setDeletingId(null);
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px", borderBottom: "1px solid var(--border)" }}>
        <BackButton label="···" />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-primary)" }}>Passkeys</span>
        <div style={{ width: 40 }} />
      </div>

      {/* Credential list */}
      <div style={{ borderTop: "1px solid var(--border)", marginTop: 16 }}>
        {credentials.map((c) => (
          <div
            key={c.id}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div>
              <div style={{ fontSize: 13, color: "var(--text-primary)" }}>
                {c.device_name ?? "Unnamed passkey"}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>
                Added {formatDate(c.created_at)} · Last used {formatDate(c.last_used_at)}
              </div>
            </div>
            {credentials.length > 1 && (
              <button
                onClick={() => handleDelete(c.id)}
                disabled={deletingId === c.id}
                style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "#c2410c", background: "none", border: "none", cursor: "pointer",
                  opacity: deletingId === c.id ? 0.5 : 1, fontFamily: "inherit",
                }}
              >
                {deletingId === c.id ? "…" : "Remove"}
              </button>
            )}
          </div>
        ))}

        {credentials.length === 0 && (
          <div style={{ padding: "32px 20px", textAlign: "center", fontSize: 13, color: "var(--text-tertiary)" }}>
            No passkeys registered.
          </div>
        )}
      </div>

      {credentials.length <= 1 && credentials.length > 0 && (
        <p style={{ fontSize: 10, color: "var(--text-tertiary)", padding: "8px 20px", letterSpacing: "0.05em" }}>
          You need at least one passkey to sign in.
        </p>
      )}
    </div>
  );
}
