"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function RollsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
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

function CameraIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function FilmIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="17" y1="7" x2="22" y2="7" />
      <line x1="2" y1="12" x2="7" y2="12" />
      <line x1="17" y1="12" x2="22" y2="12" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
    </svg>
  );
}

const TABS = [
  { href: "/", label: "Rolls", icon: RollsIcon, match: (p: string) => p === "/" || p.startsWith("/roll/") },
  { href: "/stats", label: "Stats", icon: StatsIcon, match: (p: string) => p === "/stats" },
  { href: "/cameras", label: "Cameras", icon: CameraIcon, match: (p: string) => p.startsWith("/cameras") },
  { href: "/films", label: "Films", icon: FilmIcon, match: (p: string) => p.startsWith("/films") },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-10 flex justify-center items-end gap-3 pointer-events-none px-4"
      style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
    >
      <div className="pointer-events-auto flex items-center gap-0.5 px-2 py-1 h-14 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl shadow-black/25 dark:shadow-black/60 border border-zinc-200/70 dark:border-zinc-700/60">
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
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
        className="pointer-events-auto flex-shrink-0 w-14 h-14 aspect-square rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 text-white shadow-xl shadow-amber-400/40 dark:shadow-amber-500/30 active:scale-95 transition-transform text-3xl font-light leading-none"
      >
        +
      </Link>
    </nav>
  );
}
