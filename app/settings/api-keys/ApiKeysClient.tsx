"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiKey } from "@/lib/db";
import BackButton from "@/components/BackButton";
import FormButton from "@/components/FormButton";
import Sheet from "@/components/Sheet";
import { haptics } from "@/lib/haptics";

const labelCls = "block text-[10px] uppercase tracking-widest text-zinc-400";
const inputCls = "w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white py-2 text-base focus:outline-none transition-colors";

function formatDate(s: string | null): string {
  if (!s) return "Never";
  return new Date(s).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    haptics.light();
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={copy} className="text-xs font-mono text-amber-600 dark:text-amber-400 hover:opacity-70 transition-opacity break-all text-left">
      {copied ? "Copied!" : text}
    </button>
  );
}

export default function ApiKeysClient({ initialKeys }: { initialKeys: ApiKey[] }) {
  const router = useRouter();
  const [keys, setKeys] = useState(initialKeys);
  const [showCreate, setShowCreate] = useState(false);
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
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

  return (
    <div>
      <BackButton label="Settings" />
      <h1 className="text-3xl font-bold mb-6">API Keys</h1>

      {/* One-time new key banner */}
      {newKey && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-400 font-medium">
            Save this key — it won't be shown again
          </p>
          <CopyButton text={newKey} />
          <p className="text-[11px] text-amber-600/70 dark:text-amber-500/70">
            Tap to copy. Use it in your CLI config as <code className="font-mono">web_app_api_key</code>, or run <code className="font-mono">rolls login</code>.
          </p>
          <button
            onClick={() => setNewKey(null)}
            className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 hover:opacity-70 transition-opacity"
          >
            Dismiss
          </button>
        </div>
      )}

      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 mb-6">
        {keys.map((k) => (
          <li key={k.id} className="px-4 py-3 flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-medium">{k.label ?? <span className="text-zinc-400 italic">Unlabeled</span>}</div>
              <div className="text-[12px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                Created {formatDate(k.created_at)} · Last used {formatDate(k.last_used_at)}
              </div>
            </div>
            <button
              onClick={() => handleDelete(k.id)}
              disabled={deletingId === k.id}
              className="text-[10px] uppercase tracking-widest text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors disabled:opacity-50 shrink-0"
            >
              {deletingId === k.id ? "…" : "Revoke"}
            </button>
          </li>
        ))}
        {keys.length === 0 && (
          <li className="text-zinc-500 text-sm text-center py-8">No API keys yet.</li>
        )}
      </ul>

      <button
        onClick={() => { setShowCreate(true); setCreateError(""); haptics.light(); }}
        className="w-full flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-3 mt-2 mb-3 text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
      >
        <span>New API Key</span>
        <span className="text-sm leading-none">+</span>
      </button>

      <Sheet open={showCreate} onClose={() => { setShowCreate(false); setCreateError(""); }} title="New API Key">
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-1">
            <label className={labelCls}>Label <span className="normal-case">(optional)</span></label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. rolls CLI"
              className={inputCls}
              autoFocus
            />
          </div>
          {createError && <p className="text-red-400 text-xs tracking-wide">{createError}</p>}
          <FormButton type="submit" disabled={creating}>
            {creating ? "Creating…" : "Create Key"}
          </FormButton>
        </form>
      </Sheet>
    </div>
  );
}
