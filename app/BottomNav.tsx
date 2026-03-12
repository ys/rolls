"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { haptics } from "../lib/haptics";
import { Image, ChartLine, Gear, Plus, Camera } from "@phosphor-icons/react";

type NavAnim = "idle" | "hiding" | "hidden" | "showing";

const TABS = [
  { href: "/",         icon: Image,     match: (p: string) => p === "/" || p.startsWith("/roll/") },
  { href: "/stats",    icon: ChartLine, match: (p: string) => p === "/stats" },
  { href: "/cameras",  icon: Camera,    match: (p: string) => p.startsWith("/cameras") || p.startsWith("/films") },
  { href: "/settings", icon: Gear,      match: (p: string) => p.startsWith("/settings") },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [anim, setAnim] = useState<NavAnim>("idle");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    // Check initial state
    if (document.body.hasAttribute("data-mass-edit") || document.body.hasAttribute("data-notes-edit")) {
      setAnim("hidden");
    }

    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      if (document.body.hasAttribute("data-mass-edit") || document.body.hasAttribute("data-notes-edit")) {
        setAnim("hiding");
        timer = setTimeout(() => setAnim("hidden"), 240);
      } else {
        setAnim("showing");
        timer = setTimeout(() => setAnim("idle"), 240);
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-mass-edit", "data-notes-edit"] });
    return () => { observer.disconnect(); clearTimeout(timer); };
  }, []);

  if (pathname === "/login" || pathname === "/register") return null;

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
      className="fixed bottom-0 inset-x-0 z-50 flex justify-center items-center gap-0 pointer-events-none"
      style={{
        paddingBottom: "calc(env(safe-area-inset-bottom))",
        height: 64,
      }}
    >
      {/* Icon container */}
      <div
        className="pointer-events-auto flex items-center justify-around border-t"
        style={{
          ...animStyle,
          width: "100%",
          maxWidth: "42rem",
          height: 64,
          borderColor: "var(--darkroom-border)",
          backgroundColor: "var(--darkroom-bg)",
        }}
      >
        {TABS.map(({ href, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              aria-label={href.slice(1) || "rolls"}
              onClick={() => haptics.light()}
              className="relative flex items-center justify-center transition-colors duration-200 active:scale-90"
              style={{ width: 60, height: 64 }}
            >
              <Icon
                size={22}
                weight={active ? "fill" : "regular"}
                style={{ color: active ? "var(--darkroom-accent)" : "var(--darkroom-text-tertiary)" }}
              />
            </Link>
          );
        })}

        {/* FAB in center position */}
        <Link
          href="/new"
          aria-label="New roll"
          onClick={() => haptics.medium()}
          className="absolute left-1/2 flex-shrink-0 flex items-center justify-center rounded-full active:scale-90 transition-transform"
          style={{
            ...animStyle,
            width: 48,
            height: 48,
            marginLeft: -24,
            top: "50%",
            marginTop: -24,
            background: "var(--darkroom-accent)",
            boxShadow: "0 4px 12px rgba(251, 191, 36, 0.3)",
          }}
        >
          <Plus size={26} weight="bold" color="#000" />
        </Link>
      </div>
    </nav>
  );
}
