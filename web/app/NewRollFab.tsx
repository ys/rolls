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
        bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500
        text-white
        shadow-2xl shadow-amber-400/60
        active:scale-95 transition-transform"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        {/* Short sun rays outside the film reel */}
        <line x1="12" y1="2"    x2="12" y2="5"    />
        <line x1="12" y1="19"   x2="12" y2="22"   />
        <line x1="2"  y1="12"   x2="5"  y2="12"   />
        <line x1="19" y1="12"   x2="22" y2="12"   />
        <line x1="5.28"  y1="5.28"  x2="7.4"  y2="7.4"  />
        <line x1="16.6"  y1="16.6"  x2="18.72" y2="18.72" />
        <line x1="18.72" y1="5.28"  x2="16.6"  y2="7.4"  />
        <line x1="7.4"   y1="16.6"  x2="5.28"  y2="18.72" />
        {/* Film reel: outer ring */}
        <circle cx="12" cy="12" r="4.5" strokeWidth="1.5" />
        {/* Film reel: center hub */}
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    </Link>
  );
}
