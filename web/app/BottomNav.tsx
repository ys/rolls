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
      className="fixed bottom-0 inset-x-0 z-10 flex justify-center pointer-events-none"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <div className="pointer-events-auto flex items-center gap-1 px-2 py-2 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-2xl rounded-3xl shadow-xl shadow-black/20 dark:shadow-black/50 border border-zinc-200/60 dark:border-zinc-700/50">
        {TABS.slice(0, 2).map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center px-5 py-1.5 gap-0.5 rounded-2xl transition-colors ${
                active
                  ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400"
                  : "text-zinc-400 dark:text-zinc-500 active:bg-zinc-100 dark:active:bg-zinc-800"
              }`}
            >
              <Icon active={active} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
        <Link
          href="/new"
          aria-label="New roll"
          className="w-10 h-10 mx-1 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 text-white shadow-md shadow-amber-300/50 active:scale-95 transition-transform text-2xl font-light leading-none"
        >
          +
        </Link>
        {TABS.slice(2).map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center px-5 py-1.5 gap-0.5 rounded-2xl transition-colors ${
                active
                  ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400"
                  : "text-zinc-400 dark:text-zinc-500 active:bg-zinc-100 dark:active:bg-zinc-800"
              }`}
            >
              <Icon active={active} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
