"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { haptics } from "../lib/haptics";
import { FilmStrip, Archive, ChartBar, Gear } from "@phosphor-icons/react";

type NavAnim = "idle" | "hiding" | "hidden" | "showing";

const TABS = [
  { href: "/",         label: "Rolls",    icon: FilmStrip, match: (p: string) => p === "/" || p.startsWith("/roll/") },
  { href: "/archive",  label: "Archive",  icon: Archive,   match: (p: string) => p.startsWith("/archive") },
  { href: "/stats",    label: "Stats",    icon: ChartBar,  match: (p: string) => p === "/stats" },
  { href: "/settings", label: "Settings", icon: Gear,      match: (p: string) => p.startsWith("/settings") || p.startsWith("/cameras") || p.startsWith("/films") },
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

  const animStyle: React.CSSProperties = {
    transformOrigin: "center bottom",
    animation:
      anim === "hiding"  ? "navFlipOut 0.24s cubic-bezier(0.4,0,1,1) forwards" :
      anim === "showing" ? "navFlipIn 0.28s cubic-bezier(0,0,0.2,1) forwards" : undefined,
    opacity:       anim === "hidden" ? 0 : undefined,
    pointerEvents: anim === "hidden" ? "none" : undefined,
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 flex justify-center items-end gap-3 pointer-events-none px-6"
      style={{ paddingBottom: "calc(1.75rem + env(safe-area-inset-bottom))" }}
    >
      {/* Tab pill */}
      <div
        className="pointer-events-auto flex items-center gap-0.5 px-2 rounded-full bg-white/80 dark:bg-zinc-900/85 backdrop-blur-xl border border-zinc-900/5 dark:border-white/10"
        style={{
          ...animStyle,
          height: 64,
          boxShadow: "0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              onClick={() => haptics.light()}
              className="relative flex items-center justify-center transition-all duration-200 active:scale-90"
              style={{ width: 60, height: 48, borderRadius: 20 }}
            >
              {active && (
                <span
                  className="absolute inset-0 bg-amber-500/12 dark:bg-amber-400/15"
                  style={{ borderRadius: 20 }}
                />
              )}
              <Icon
                size={28}
                weight={active ? "fill" : "regular"}
                className={active ? "text-amber-600 dark:text-amber-400" : "text-zinc-400 dark:text-zinc-500"}
              />
            </Link>
          );
        })}
      </div>

      {/* New roll FAB */}
      <Link
        href="/new"
        aria-label="New roll"
        onClick={() => haptics.medium()}
        className="pointer-events-auto flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-b from-amber-400 to-orange-500 text-white active:scale-90 transition-transform"
        style={{
          ...animStyle,
          width: 64,
          height: 64,
          boxShadow: "0 8px 24px rgba(234,88,12,0.45), 0 2px 6px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.25)",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="11" y1="2" x2="11" y2="20" />
          <line x1="2" y1="11" x2="20" y2="11" />
        </svg>
      </Link>
    </nav>
  );
}
