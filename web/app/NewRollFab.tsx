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
        bg-gradient-to-br from-zinc-600 to-zinc-950
        dark:from-zinc-100 dark:to-white
        text-white dark:text-zinc-900
        shadow-2xl shadow-zinc-900/40 dark:shadow-zinc-900/25
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
