"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { haptics } from "../lib/haptics";
import { FilmStrip, Archive, ChartBar, Gear, Plus } from "@phosphor-icons/react";

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
        className="pointer-events-auto flex items-center gap-0.5 px-2 rounded-full bg-white/40 dark:bg-zinc-900/60 backdrop-blur-3xl border border-white/60 dark:border-white/10"
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
                  className="absolute inset-0 bg-amber-500/10 dark:bg-amber-400/15"
                  style={{ borderRadius: 20 }}
                />
              )}
              <Icon
                size={28}
                weight={active ? "fill" : "regular"}
                className={active ? "text-amber-500 dark:text-amber-400" : "text-zinc-400 dark:text-zinc-500"}
                style={active ? { filter: "drop-shadow(0 0 6px rgb(245 158 11 / 0.8))" } : undefined}
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
        className="pointer-events-auto flex-shrink-0 flex items-center justify-center rounded-full active:scale-90 transition-transform"
        style={{
          ...animStyle,
          width: 64,
          height: 64,
          background: "linear-gradient(160deg, #fbbf24 0%, #f97316 100%)",
          boxShadow: "0 8px 24px rgba(234,88,12,0.5), 0 2px 6px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)",
        }}
      >
        <Plus size={26} weight="bold" color="white" />
      </Link>
    </nav>
  );
}
