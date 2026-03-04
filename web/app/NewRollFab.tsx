"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NewRollFab() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/new") return null;

  return (
    <Link
      href="/new"
      className="fixed bottom-6 right-4 z-20 w-14 h-14 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-3xl shadow-lg active:scale-95 transition-transform"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      aria-label="New roll"
    >
      +
    </Link>
  );
}
