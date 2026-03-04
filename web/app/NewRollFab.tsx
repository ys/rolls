"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NewRollFab() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/new") return null;

  return (
    <Link
      href="/new"
      aria-label="New roll"
      className="fixed bottom-6 right-4 z-20 w-16 h-16 rounded-full flex items-center justify-center
        bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500
        text-white
        shadow-2xl shadow-fuchsia-500/40
        active:scale-95 transition-transform"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <line x1="12" y1="4" x2="12" y2="20" />
        <line x1="4" y1="12" x2="20" y2="12" />
      </svg>
    </Link>
  );
}
