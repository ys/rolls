"use client";

import { useState } from "react";
import { SignOut } from "@phosphor-icons/react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;

    setLoading(true);
    try {
      const resp = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (resp.ok) {
        // Full page navigation to clear all state
        window.location.href = "/login";
      } else {
        console.error("Logout failed");
        setLoading(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      setLoading(false);
    }
  }

  return (
    <li>
      <button
        onClick={handleLogout}
        disabled={loading}
        className="w-full flex items-center justify-between px-4 py-3.5 border-b active:bg-zinc-900/30 transition-colors disabled:opacity-50"
        style={{ borderColor: "var(--border)" }}
      >
        <span className="text-xs" style={{ color: "#ef4444" }}>
          {loading ? "Logging out..." : "Logout"}
        </span>
        <SignOut size={16} weight="regular" style={{ color: "#ef4444" }} />
      </button>
    </li>
  );
}
