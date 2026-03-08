"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { haptics } from "../lib/haptics";
import {
  FilmStrip,
  Archive,
  ChartBar,
  Gear,
} from "@phosphor-icons/react";

type NavAnim = "idle" | "hiding" | "hidden" | "showing";

const TABS = [
  {
    href: "/",
    label: "Rolls",
    icon: FilmStrip,
    match: (p: string) => p === "/" || p.startsWith("/roll/"),
  },
  {
    href: "/archive",
    label: "Archive",
    icon: Archive,
    match: (p: string) => p.startsWith("/archive"),
  },
  {
    href: "/stats",
    label: "Stats",
    icon: ChartBar,
    match: (p: string) => p === "/stats",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Gear,
    match: (p: string) =>
      p.startsWith("/settings") ||
      p.startsWith("/cameras") ||
      p.startsWith("/films"),
  },
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
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-mass-edit"],
    });
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  if (pathname === "/login") return null;

  const pillStyle: React.CSSProperties = {
    transformOrigin: "center bottom",
    animation:
      anim === "hiding"
        ? "navFlipOut 0.24s cubic-bezier(0.4,0,1,1) forwards"
        : anim === "showing"
          ? "navFlipIn 0.28s cubic-bezier(0,0,0.2,1) forwards"
          : undefined,
    opacity: anim === "hidden" ? 0 : undefined,
    pointerEvents: anim === "hidden" ? "none" : undefined,
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-10 flex justify-center items-end gap-3 pointer-events-none px-4"
      style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
    >
      {/* Tab pill */}
      <div
        className="pointer-events-auto flex items-center gap-1 px-2 h-[58px] bg-white/75 dark:bg-zinc-900/80 backdrop-blur-3xl rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.5)] border border-white/80 dark:border-zinc-700/40"
        style={pillStyle}
      >
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              onClick={() => haptics.light()}
              className={`flex items-center justify-center w-[56px] h-[42px] rounded-[1.2rem] transition-all duration-200 ${
                active
                  ? "bg-amber-500/15 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400"
                  : "text-zinc-400 dark:text-zinc-500 active:bg-zinc-100/70 dark:active:bg-zinc-800/70"
              }`}
            >
              <Icon size={26} weight={active ? "fill" : "regular"} />
            </Link>
          );
        })}
      </div>

      {/* New roll FAB */}
      <Link
        href="/new"
        aria-label="New roll"
        onClick={() => haptics.medium()}
        className="pointer-events-auto flex-shrink-0 w-[58px] h-[58px] rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_4px_20px_rgba(245,158,11,0.55),0_1px_3px_rgba(0,0,0,0.1)] active:scale-95 transition-transform"
        style={pillStyle}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </Link>
    </nav>
  );
}
