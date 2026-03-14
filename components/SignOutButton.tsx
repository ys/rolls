"use client";

import { useState } from "react";
import { invalidateCache } from "@/lib/cache";

export default function SignOutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;
    setLoading(true);
    try {
      invalidateCache();
      const resp = await fetch("/api/auth/logout", { method: "POST" });
      if (resp.ok) {
        window.location.href = "/login";
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={{
        width: "100%",
        padding: "12px 0",
        background: "none",
        border: "1px solid var(--border)",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--text-tertiary)",
        fontFamily: "inherit",
        cursor: "pointer",
        opacity: loading ? 0.5 : 1,
      }}
    >
      {loading ? "Signing out…" : "Sign Out"}
    </button>
  );
}
