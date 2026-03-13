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
  if (!s) return "—";
  return new Date(s).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const inputCls = "w-full bg-transparent border-b py-2 text-base focus:outline-none transition-colors";
const inputStyle = { borderColor: "var(--darkroom-border)", color: "var(--darkroom-text-primary)" };
const labelCls = "block text-[10px] uppercase tracking-widest";
const labelStyle = { color: "var(--darkroom-text-secondary)" };

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    haptics.light();
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={copy}
      className="text-xs font-mono transition-opacity active:opacity-60"
      style={{ color: "var(--darkroom-text-secondary)" }}
    >
      {copied ? "Copied!" : text}
    </button>
  );
}

function ShareButton({ inviteCode }: { inviteCode: string }) {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  async function handleShare() {
    const url = `${window.location.origin}/register?invite=${inviteCode}`;

    try {
      await navigator.share({
        title: "Join Rolls",
        text: "You've been invited to join Rolls, an analog film roll tracker.",
        url,
      });
      haptics.success();
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Share failed:", err);
        haptics.error();
      }
    }
  }

  if (!canShare) return null;

  return (
    <button
      onClick={handleShare}
      className="text-[10px] uppercase tracking-widest transition-opacity active:opacity-60"
      style={{ color: "var(--darkroom-text-secondary)" }}
    >
      Share
    </button>
  );
}

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

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [maxUses, setMaxUses] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Send form
  const [sendingCode, setSendingCode] = useState<string | null>(null);
  const [sendEmail, setSendEmail] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError("");

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
      setCreating(false);
      haptics.error();
      return;
    }

    const { invite } = await resp.json();
    setInvites((prev) => [invite, ...prev]);
    setMaxUses("");
    setExpiresInDays("");
    setShowCreate(false);
    setCreating(false);
    haptics.success();
    router.refresh();
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setSendError("");
    setSendSuccess("");

    const resp = await fetch("/api/auth/invites/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invite_code: sendingCode,
        email: sendEmail,
        message: sendMessage || undefined,
      }),
    });

    if (!resp.ok) {
      const data = await resp.json();
      setSendError(data.error ?? "Failed to send invite");
      setSending(false);
      haptics.error();
      return;
    }

    setSendSuccess(`Invite sent to ${sendEmail}`);
    setSendEmail("");
    setSendMessage("");
    setSending(false);
    haptics.success();
    setTimeout(() => {
      setSendingCode(null);
      setSendSuccess("");
    }, 2000);
  }

  async function handleDelete(invite: Invite) {
    setDeletingId(invite.id);

    const resp = await fetch(`/api/auth/invites/${invite.id}`, {
      method: "DELETE",
    });

    if (resp.ok) {
      setInvites((prev) => prev.filter((i) => i.id !== invite.id));
      haptics.success();
      router.refresh();
    } else {
      haptics.error();
    }

    setDeletingId(null);
  }

  const remainingInvites = inviteQuota !== null ? inviteQuota - invitesSent : null;
  const canCreateInvite = isAdmin || (remainingInvites !== null && remainingInvites > 0);

  // Normal user view
  if (!isAdmin) {
    return (
      <div>
        <div className="flex items-center justify-between px-4 py-4 border-b mb-6" style={{ borderColor: "var(--darkroom-border)" }}>
          <BackButton label="Settings" />
          <h1 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--darkroom-text-primary)" }}>Invitations</h1>
          <div className="w-8" />
        </div>

        <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: "var(--darkroom-card)" }}>
          <div className="text-center mb-6">
            <div className="text-5xl font-bold mb-2">
              {remainingInvites !== null ? remainingInvites : "∞"}
            </div>
            <p className="text-sm" style={{ color: "var(--darkroom-text-secondary)" }}>
              {remainingInvites !== null
                ? `invite${remainingInvites !== 1 ? "s" : ""} remaining`
                : "unlimited invites"}
            </p>
          </div>

          {canCreateInvite && (
            <button
              onClick={() => { setShowCreate(true); setCreateError(""); haptics.light(); }}
              className="w-full border py-3 text-xs tracking-widest uppercase font-medium transition-opacity active:opacity-60"
              style={{ borderColor: "var(--darkroom-border)", color: "var(--darkroom-text-primary)" }}
            >
              Create Invite
            </button>
          )}

          {!canCreateInvite && remainingInvites === 0 && (
            <p className="text-sm text-center" style={{ color: "var(--darkroom-text-secondary)" }}>
              You've used all your invites
            </p>
          )}
        </div>

        {invites.length > 0 && (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-wider px-1 mb-3" style={{ color: "var(--darkroom-text-secondary)" }}>Your Invites</p>
            <ul className="rounded-2xl overflow-hidden mb-6" style={{ backgroundColor: "var(--darkroom-card)" }}>
              {invites.map((invite) => {
                const valid = isValid(invite);
                return (
                  <li key={invite.id} className="px-4 py-3 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <CopyButton text={invite.code} />
                        <span
                          className="text-[10px] uppercase tracking-widest font-medium"
                          style={{ color: valid ? "#4ade80" : "var(--darkroom-text-tertiary)" }}
                        >
                          {valid ? "valid" : "used"}
                        </span>
                      </div>
                      {valid && <ShareButton inviteCode={invite.code} />}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <Sheet
          open={showCreate}
          onClose={() => { setShowCreate(false); setCreateError(""); }}
          title="Create Invite"
        >
          <form onSubmit={handleCreate} className="space-y-6">
            <p className="text-sm" style={{ color: "var(--darkroom-text-secondary)" }}>
              This will create a single-use invite that you can share with a friend.
            </p>
            {createError && <p className="text-red-400 text-xs tracking-wide">{createError}</p>}
            <FormButton type="submit" disabled={creating}>
              {creating ? "Creating…" : "Create Invite"}
            </FormButton>
          </form>
        </Sheet>
      </div>
    );
  }

  // Admin view
  return (
    <div>
      <div className="flex items-center justify-between px-4 py-4 border-b mb-6" style={{ borderColor: "var(--darkroom-border)" }}>
        <BackButton label="Settings" />
        <h1 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--darkroom-text-primary)" }}>Invitations</h1>
        <div className="w-8" />
      </div>

      <ul className="rounded-2xl overflow-hidden mb-6" style={{ backgroundColor: "var(--darkroom-card)" }}>
        {invites.map((invite) => {
          const valid = isValid(invite);
          return (
            <li key={invite.id} className="px-4 py-3 space-y-2 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CopyButton text={invite.code} />
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-[10px] uppercase tracking-widest font-medium"
                      style={{ color: valid ? "#4ade80" : "var(--darkroom-text-tertiary)" }}
                    >
                      {valid ? "valid" : "used/expired"}
                    </span>
                    {invite.used_count > 0 && (
                      <span className="text-xs" style={{ color: "var(--darkroom-text-secondary)" }}>
                        {invite.used_count} use{invite.used_count !== 1 ? "s" : ""}
                        {invite.max_uses ? ` / ${invite.max_uses}` : ""}
                      </span>
                    )}
                    {invite.expires_at && (
                      <span className="text-xs" style={{ color: "var(--darkroom-text-secondary)" }}>
                        expires {formatDate(invite.expires_at)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {valid && (
                    <>
                      <ShareButton inviteCode={invite.code} />
                      <button
                        onClick={() => {
                          setSendingCode(sendingCode === invite.code ? null : invite.code);
                          setSendEmail("");
                          setSendMessage("");
                          setSendError("");
                          setSendSuccess("");
                          haptics.light();
                        }}
                        className="text-[10px] uppercase tracking-widest transition-opacity active:opacity-60"
                        style={{ color: "var(--darkroom-text-secondary)" }}
                      >
                        Send
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(invite)}
                    disabled={deletingId === invite.id}
                    className="text-[10px] uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                  >
                    {deletingId === invite.id ? "…" : "Delete"}
                  </button>
                </div>
              </div>

              {sendingCode === invite.code && (
                <form onSubmit={handleSend} className="space-y-4 pt-3 border-t" style={{ borderColor: "var(--darkroom-border)" }}>
                  <div className="space-y-1">
                    <label className={labelCls} style={labelStyle}>Email</label>
                    <input type="email" value={sendEmail} onChange={(e) => setSendEmail(e.target.value)} required className={inputCls} style={inputStyle} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls} style={labelStyle}>Message <span className="normal-case">(optional)</span></label>
                    <input type="text" value={sendMessage} onChange={(e) => setSendMessage(e.target.value)} className={inputCls} style={inputStyle} />
                  </div>
                  {sendError && <p className="text-red-400 text-xs tracking-wide">{sendError}</p>}
                  {sendSuccess && <p className="text-xs tracking-wide" style={{ color: "#4ade80" }}>{sendSuccess}</p>}
                  <FormButton type="submit" disabled={sending}>
                    {sending ? "Sending…" : "Send Invite"}
                  </FormButton>
                  <FormButton variant="secondary" onClick={() => setSendingCode(null)}>
                    Cancel
                  </FormButton>
                </form>
              )}
            </li>
          );
        })}
        {invites.length === 0 && (
          <li className="text-sm text-center py-8" style={{ color: "var(--darkroom-text-secondary)" }}>
            No invites yet.
          </li>
        )}
      </ul>

      <button
        onClick={() => { setShowCreate(true); setCreateError(""); haptics.light(); }}
        className="w-full flex items-center justify-between border-t pt-3 mt-2 mb-3 text-[10px] uppercase tracking-widest transition-opacity active:opacity-60"
        style={{ borderColor: "var(--darkroom-border)", color: "var(--darkroom-text-secondary)" }}
      >
        <span>Create Invite</span>
        <span className="text-sm leading-none">+</span>
      </button>

      <Sheet open={showCreate} onClose={() => { setShowCreate(false); setCreateError(""); }} title="Create Invite">
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-1">
            <label className={labelCls} style={labelStyle}>Max uses <span className="normal-case">(blank = unlimited)</span></label>
            <input type="number" min="1" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="e.g. 1" className={inputCls} style={inputStyle} />
          </div>
          <div className="space-y-1">
            <label className={labelCls} style={labelStyle}>Expires in days <span className="normal-case">(blank = never)</span></label>
            <input type="number" min="1" value={expiresInDays} onChange={(e) => setExpiresInDays(e.target.value)} placeholder="e.g. 7" className={inputCls} style={inputStyle} />
          </div>
          {createError && <p className="text-red-400 text-xs tracking-wide">{createError}</p>}
          <FormButton type="submit" disabled={creating}>
            {creating ? "Creating…" : "Create Invite"}
          </FormButton>
        </form>
      </Sheet>
    </div>
  );
}
