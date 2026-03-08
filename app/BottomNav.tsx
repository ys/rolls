"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { haptics } from "../lib/haptics";
import { Images } from "pixelarticons/react/Images";
import { Archive } from "pixelarticons/react/Archive";
import { Chart } from "pixelarticons/react/Chart";
import { Settings2 } from "pixelarticons/react/Settings2";
import { Plus } from "pixelarticons/react/Plus";

type NavAnim = "idle" | "hiding" | "hidden" | "showing";

const TABS = [
  { href: "/",         label: "Rolls",    icon: Images,      match: (p: string) => p === "/" || p.startsWith("/roll/") },
  { href: "/archive",  label: "Archive",  icon: Archive,     match: (p: string) => p.startsWith("/archive") },
  { href: "/stats",    label: "Stats",    icon: Chart,       match: (p: string) => p === "/stats" },
  { href: "/settings", label: "Settings", icon: Settings2, match: (p: string) => p.startsWith("/settings") || p.startsWith("/cameras") || p.startsWith("/films") },
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
      className="fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-zinc-950 border-t-2 border-zinc-900 dark:border-zinc-100"
      style={{
        ...animStyle,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-center h-14 max-w-2xl mx-auto px-2">
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              onClick={() => haptics.light()}
              className="flex-1 flex items-center justify-center h-full active:opacity-40 transition-opacity"
            >
              <Icon
                width={24}
                height={24}
                className={active ? "text-amber-500 dark:text-amber-400" : "text-zinc-400 dark:text-zinc-500"}
                style={active ? { filter: "drop-shadow(0 0 5px rgb(245 158 11 / 0.7))" } : undefined}
              />
            </Link>
          );
        })}

        {/* New roll button */}
        <Link
          href="/new"
          aria-label="New roll"
          onClick={() => haptics.medium()}
          className="flex items-center justify-center w-10 h-10 bg-amber-500 active:opacity-70 transition-opacity ml-1"
        >
          <Plus width={20} height={20} className="text-white" />
        </Link>
      </div>
    </nav>
  );
}
