"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Invite } from "@/lib/db";
import BackButton from "@/components/BackButton";
import FormButton from "@/components/FormButton";
import Sheet from "@/components/Sheet";
import { haptics } from "@/lib/haptics";

function isValid(invite: Invite): boolean {
  return (
    (!invite.expires_at || new Date(invite.expires_at) > new Date()) &&
    (invite.max_uses === null || invite.used_count < invite.max_uses)
  );
}

function formatDate(s: string | null): string {
  if (!s) return "No expiry";
  return `Expires ${new Date(s).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

function usesLabel(invite: Invite): string {
  if (invite.max_uses === null) return "∞ uses";
  return `${invite.used_count} / ${invite.max_uses} used`;
}

function CopyLinkButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    const url = `${window.location.origin}/register?invite=${code}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    haptics.light();
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button onClick={copy} style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}

const labelCls = "block text-[10px] uppercase tracking-widest";
const labelStyle = { color: "var(--text-secondary)" } as React.CSSProperties;
const inputCls = "w-full bg-transparent border-b py-2 text-base focus:outline-none transition-colors";
const inputStyle = { borderColor: "var(--border)", color: "var(--text-primary)" } as React.CSSProperties;

export default function InvitesClient({
  initialInvites,
  isAdmin,
  inviteQuota,
  invitesSent,
}: {
  initialInvites: Invite[];
  isAdmin: boolean;
  inviteQuota: number | null;
  invitesSent: number;
}) {
  const router = useRouter();
  const [invites, setInvites] = useState(initialInvites);
  const [showCreate, setShowCreate] = useState(false);
  const [maxUses, setMaxUses] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [sendingCode, setSendingCode] = useState<string | null>(null);
  const [sendEmail, setSendEmail] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const remainingInvites = inviteQuota !== null ? inviteQuota - invitesSent : null;
  const canCreateInvite = isAdmin || (remainingInvites !== null && remainingInvites > 0);

  const activeInvites = invites.filter(isValid);
  const expiredInvites = invites.filter((i) => !isValid(i));

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true); setCreateError("");
    const resp = await fetch("/api/auth/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        max_uses: maxUses ? parseInt(maxUses, 10) : null,
        expires_in_days: expiresInDays ? parseInt(expiresInDays, 10) : null,
      }),
    });
    if (!resp.ok) {
      const data = await resp.json();
      setCreateError(data.error ?? "Failed to create invite");
      setCreating(false); haptics.error(); return;
    }
    const { invite } = await resp.json();
    setInvites((prev) => [invite, ...prev]);
    setMaxUses(""); setExpiresInDays("");
    setShowCreate(false); setCreating(false); haptics.success();
    router.refresh();
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true); setSendError(""); setSendSuccess("");
    const resp = await fetch("/api/auth/invites/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invite_code: sendingCode, email: sendEmail, message: sendMessage || undefined }),
    });
    if (!resp.ok) {
      const data = await resp.json();
      setSendError(data.error ?? "Failed to send invite");
      setSending(false); haptics.error(); return;
    }
    setSendSuccess(`Sent to ${sendEmail}`);
    setSendEmail(""); setSendMessage(""); setSending(false); haptics.success();
    setTimeout(() => { setSendingCode(null); setSendSuccess(""); }, 2000);
  }

  async function handleDelete(invite: Invite) {
    setDeletingId(invite.id);
    const resp = await fetch(`/api/auth/invites/${invite.id}`, { method: "DELETE" });
    if (resp.ok) { setInvites((prev) => prev.filter((i) => i.id !== invite.id)); haptics.success(); router.refresh(); }
    else haptics.error();
    setDeletingId(null);
  }

  function InviteRow({ invite }: { invite: Invite }) {
    const valid = isValid(invite);
    return (
      <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "inherit" }}>{invite.code}</div>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{usesLabel(invite)}</div>
        </div>
        <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>{formatDate(invite.expires_at)}</div>
        <div style={{ display: "flex", gap: 12, marginTop: 8, alignItems: "center" }}>
          {valid && <CopyLinkButton code={invite.code} />}
          {valid && (
            <button
              onClick={() => { setSendingCode(sendingCode === invite.code ? null : invite.code); setSendEmail(""); setSendMessage(""); setSendError(""); setSendSuccess(""); haptics.light(); }}
              style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              Send email
            </button>
          )}
          {(isAdmin || !valid) && (
            <button
              onClick={() => handleDelete(invite)}
              disabled={deletingId === invite.id}
              style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c2410c", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", opacity: deletingId === invite.id ? 0.5 : 1, marginLeft: "auto" }}
            >
              {deletingId === invite.id ? "…" : "Delete"}
            </button>
          )}
        </div>
        {sendingCode === invite.code && (
          <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
            <div>
              <label className={labelCls} style={labelStyle}>Email</label>
              <input type="email" value={sendEmail} onChange={(e) => setSendEmail(e.target.value)} required className={inputCls} style={inputStyle} autoFocus />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Message (optional)</label>
              <input type="text" value={sendMessage} onChange={(e) => setSendMessage(e.target.value)} className={inputCls} style={inputStyle} />
            </div>
            {sendError && <p style={{ fontSize: 11, color: "#f87171" }}>{sendError}</p>}
            {sendSuccess && <p style={{ fontSize: 11, color: "#4ade80" }}>{sendSuccess}</p>}
            <FormButton type="submit" disabled={sending}>{sending ? "Sending…" : "Send Invite"}</FormButton>
            <FormButton variant="secondary" onClick={() => setSendingCode(null)}>Cancel</FormButton>
          </form>
        )}
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px", borderBottom: "1px solid var(--border)" }}>
        <BackButton label="···" />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-primary)" }}>Invitations</span>
        <div style={{ width: 40 }} />
      </div>

      {/* Quota (non-admin) */}
      {!isAdmin && remainingInvites !== null && (
        <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", fontSize: 11, color: "var(--text-tertiary)" }}>
          {remainingInvites} invite{remainingInvites !== 1 ? "s" : ""} remaining
        </div>
      )}

      {/* Active section */}
      {activeInvites.length > 0 && (
        <div style={{ borderTop: "1px solid var(--border)", marginTop: 16 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-tertiary)", padding: "12px 20px 6px" }}>Active</div>
          {activeInvites.map((invite) => <InviteRow key={invite.id} invite={invite} />)}
        </div>
      )}

      {/* Expired section (admin only) */}
      {isAdmin && expiredInvites.length > 0 && (
        <div style={{ borderTop: "1px solid var(--border)", marginTop: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-tertiary)", padding: "12px 20px 6px" }}>Expired / Used</div>
          {expiredInvites.map((invite) => <InviteRow key={invite.id} invite={invite} />)}
        </div>
      )}

      {invites.length === 0 && (
        <div style={{ padding: "48px 20px", textAlign: "center", fontSize: 13, color: "var(--text-tertiary)" }}>
          No invitations yet.
        </div>
      )}

      {/* Add row */}
      {canCreateInvite && (
        <div style={{ borderTop: "1px solid var(--border)", marginTop: 4 }}>
          <button onClick={() => { setShowCreate(true); setCreateError(""); haptics.light(); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "none", border: "none", width: "100%", fontFamily: "inherit", cursor: "pointer" }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>New Invite</span>
            <span style={{ fontSize: 16, color: "var(--accent)", lineHeight: 1 }}>+</span>
          </button>
        </div>
      )}

      <Sheet open={showCreate} onClose={() => { setShowCreate(false); setCreateError(""); }} title="New Invite">
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {isAdmin && (
            <>
              <div>
                <label className={labelCls} style={labelStyle}>Max uses <span style={{ textTransform: "none", fontWeight: 400 }}>(blank = unlimited)</span></label>
                <input type="number" min="1" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="e.g. 3" className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Expires in days <span style={{ textTransform: "none", fontWeight: 400 }}>(blank = never)</span></label>
                <input type="number" min="1" value={expiresInDays} onChange={(e) => setExpiresInDays(e.target.value)} placeholder="e.g. 7" className={inputCls} style={inputStyle} />
              </div>
            </>
          )}
          {createError && <p style={{ fontSize: 11, color: "#f87171" }}>{createError}</p>}
          <FormButton type="submit" disabled={creating}>{creating ? "Creating…" : "Create Invite"}</FormButton>
        </form>
      </Sheet>
    </div>
  );
}
