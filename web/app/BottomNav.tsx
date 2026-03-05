"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { haptics } from "../lib/haptics";

type NavAnim = "idle" | "hiding" | "hidden" | "showing";

function RollsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function ArchiveIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
    </svg>
  );
}

function StatsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="4" height="9" rx="1" />
      <rect x="10" y="4" width="4" height="16" rx="1" />
      <rect x="16" y="8" width="4" height="12" rx="1" />
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

const TABS = [
  { href: "/", label: "Rolls", icon: RollsIcon, match: (p: string) => p === "/" || p.startsWith("/roll/") },
  { href: "/archive", label: "Archive", icon: ArchiveIcon, match: (p: string) => p.startsWith("/archive") },
  { href: "/stats", label: "Stats", icon: StatsIcon, match: (p: string) => p === "/stats" },
  { href: "/settings", label: "Settings", icon: SettingsIcon, match: (p: string) => p.startsWith("/settings") || p.startsWith("/cameras") || p.startsWith("/films") },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [anim, setAnim] = useState<NavAnim>("idle");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      if (document.body.hasAttribute("data-mass-edit")) {
        setAnim("hiding");
        timer = setTimeout(() => setAnim("hidden"), 240);
      } else {
        setAnim("showing");
        timer = setTimeout(() => setAnim("idle"), 240);
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-mass-edit"] });
    return () => { observer.disconnect(); clearTimeout(timer); };
  }, []);

  if (pathname === "/login") return null;

  const pillStyle: React.CSSProperties = {
    transformOrigin: "center bottom",
    animation: anim === "hiding"  ? "navFlipOut 0.24s cubic-bezier(0.4,0,1,1) forwards"
             : anim === "showing" ? "navFlipIn 0.28s cubic-bezier(0,0,0.2,1) forwards"
             : undefined,
    opacity:       anim === "hidden" ? 0 : undefined,
    pointerEvents: anim === "hidden" ? "none" : undefined,
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-10 flex justify-center items-end gap-3 pointer-events-none px-4"
      style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
    >
      <div
        className="pointer-events-auto flex items-center gap-0.5 px-2 py-1 h-14 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl shadow-black/25 dark:shadow-black/60 border border-zinc-200/70 dark:border-zinc-700/60"
        style={pillStyle}
      >
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => haptics.light()}
              className={`flex flex-col items-center justify-center min-w-[68px] h-full px-3 gap-0.5 rounded-[1.5rem] transition-all duration-200 ${
                active
                  ? "bg-zinc-900/10 dark:bg-white/10 text-amber-600 dark:text-amber-400 shadow-inner"
                  : "text-zinc-400 dark:text-zinc-500 active:bg-zinc-100/50 dark:active:bg-zinc-800/50"
              }`}
            >
              <Icon active={active} />
              <span className="text-[10px] font-medium whitespace-nowrap">{label}</span>
            </Link>
          );
        })}
      </div>
      <Link
        href="/new"
        aria-label="New roll"
        onClick={() => haptics.medium()}
        className="pointer-events-auto flex-shrink-0 w-14 h-14 aspect-square rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 text-white shadow-xl shadow-amber-400/40 dark:shadow-amber-500/30 active:scale-95 transition-transform text-3xl font-light leading-none"
        style={pillStyle}
      >
        +
      </Link>
    </nav>
  );
}
