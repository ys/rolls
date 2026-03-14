"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiKey } from "@/lib/db";
import BackButton from "@/components/BackButton";
import Sheet from "@/components/Sheet";
import FormButton from "@/components/FormButton";
import FormField from "@/components/FormField";
import { haptics } from "@/lib/haptics";

function formatDate(s: string | null): string {
  if (!s) return "Never";
  return new Date(s).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

const S = {
  row: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 20px", borderBottom: "1px solid var(--border-subtle)",
  } as React.CSSProperties,
  label: { fontSize: 13, color: "var(--text-primary)" } as React.CSSProperties,
  sub: { fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 } as React.CSSProperties,
  revoke: {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const,
    color: "#c2410c", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
  },
  addRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    borderTop: "1px solid var(--border)", padding: "12px 20px", marginTop: 4, cursor: "pointer",
    background: "none", border: "none", width: "100%", fontFamily: "inherit",
  } as React.CSSProperties,
};

export default function ApiKeysClient({ initialKeys }: { initialKeys: ApiKey[] }) {
  const router = useRouter();
  const [keys, setKeys] = useState(initialKeys);
  const [showCreate, setShowCreate] = useState(false);
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [newKeyLabel, setNewKeyLabel] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    const resp = await fetch("/api/auth/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: label || undefined }),
    });
    if (!resp.ok) {
      const data = await resp.json();
      setCreateError(data.error ?? "Failed to create key");
      setCreating(false);
      haptics.error();
      return;
    }
    const { api_key, raw_key } = await resp.json();
    setKeys((prev) => [{ ...api_key, last_used_at: null }, ...prev]);
    setNewKey(raw_key);
    setNewKeyLabel(label || null);
    setLabel("");
    setShowCreate(false);
    setCreating(false);
    haptics.success();
    router.refresh();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const resp = await fetch(`/api/auth/api-keys/${id}`, { method: "DELETE" });
    if (resp.ok) {
      setKeys((prev) => prev.filter((k) => k.id !== id));
      haptics.success();
      router.refresh();
    } else {
      haptics.error();
    }
    setDeletingId(null);
  }

  async function copyKey() {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    haptics.light();
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px", borderBottom: "1px solid var(--border)" }}>
        <BackButton label="···" />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-primary)" }}>API Keys</span>
        <div style={{ width: 40 }} />
      </div>

      {/* One-time new key banner */}
      {newKey && (
        <div style={{ margin: "16px 20px", padding: "12px 16px", border: "1px solid #d97706", background: "rgba(217,119,6,0.06)" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#d97706", marginBottom: 6 }}>
            Save this key — shown once
          </div>
          <button
            onClick={copyKey}
            style={{ fontSize: 11, color: "var(--text-primary)", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "monospace", wordBreak: "break-all", textAlign: "left" }}
          >
            {copied ? "Copied!" : newKey}
          </button>
          <div style={{ fontSize: 9, color: "var(--text-tertiary)", marginTop: 6 }}>
            Tap to copy · Use as <span style={{ color: "var(--text-primary)" }}>web_app_api_key</span>
          </div>
          <button
            onClick={() => { setNewKey(null); setNewKeyLabel(null); }}
            style={{ fontSize: 9, color: "var(--text-tertiary)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", marginTop: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Key list */}
      <div style={{ borderTop: "1px solid var(--border)" }}>
        {keys.map((k) => (
          <div key={k.id} style={S.row}>
            <div>
              <div style={S.label}>
                {k.label ?? <span style={{ fontStyle: "italic", color: "var(--text-tertiary)" }}>Unlabeled</span>}
              </div>
              <div style={S.sub}>
                Created {formatDate(k.created_at)} · Last used {formatDate(k.last_used_at)}
              </div>
            </div>
            <button
              onClick={() => { haptics.light(); handleDelete(k.id); }}
              disabled={deletingId === k.id}
              style={{ ...S.revoke, opacity: deletingId === k.id ? 0.5 : 1 }}
            >
              {deletingId === k.id ? "…" : "Revoke"}
            </button>
          </div>
        ))}
        {keys.length === 0 && (
          <div style={{ padding: "32px 20px", textAlign: "center", fontSize: 13, color: "var(--text-tertiary)" }}>
            No API keys yet.
          </div>
        )}
      </div>

      {/* Add row */}
      <div style={{ borderTop: "1px solid var(--border)", marginTop: 4 }}>
        <button
          onClick={() => { setShowCreate(true); setCreateError(""); haptics.light(); }}
          style={S.addRow}
        >
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>New API Key</span>
          <span style={{ fontSize: 16, color: "var(--accent)", lineHeight: 1 }}>+</span>
        </button>
      </div>

      <Sheet open={showCreate} onClose={() => { setShowCreate(false); setCreateError(""); }} title="New API Key">
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <FormField
            label="Label (optional)"
            value={label}
            onChange={setLabel}
            placeholder="e.g. rolls CLI"
          />
          {createError && <p style={{ fontSize: 11, color: "#f87171" }}>{createError}</p>}
          <FormButton type="submit" disabled={creating}>
            {creating ? "Creating…" : "Create Key"}
          </FormButton>
        </form>
      </Sheet>
    </div>
  );
}
