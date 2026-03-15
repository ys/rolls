"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { haptics } from "../lib/haptics";

type NavAnim = "idle" | "hiding" | "hidden" | "showing";

const TABS = [
  { href: "/",         label: "Rolls",   match: (p: string) => p === "/" },
  { href: "/archive",  label: "Archive", match: (p: string) => p === "/archive" },
  { href: "/settings", label: "···",     match: (p: string) => p.startsWith("/settings") || p === "/stats" },
];

// Nav is only visible on top-level list views
const NAV_PATHS = ["/", "/archive", "/stats"];

export default function BottomNav() {
  const pathname = usePathname();
  const [anim, setAnim] = useState<NavAnim>("idle");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

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

  const showOnThisRoute = NAV_PATHS.includes(pathname) || pathname.startsWith("/settings");
  if (!showOnThisRoute || pathname === "/login" || pathname === "/register") return null;

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
      className="fixed bottom-0 inset-x-0 z-50 flex justify-center items-center pointer-events-none"
    >
      <div
        className="pointer-events-auto w-full"
        style={{
          ...animStyle,
          maxWidth: "42rem",
          borderRadius: "12px 12px 0 0",
          backgroundColor: "#1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 28px",
          paddingBottom: "calc(14px + env(safe-area-inset-bottom))",
        }}
      >
        {/* Left: text tabs */}
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {TABS.map(({ href, label, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                prefetch={true}
                onClick={() => haptics.light()}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: active ? "var(--accent)" : "var(--bg)",
                  borderBottom: active ? "1.5px solid var(--accent)" : "1.5px solid transparent",
                  paddingBottom: 3,
                  textDecoration: "none",
                  padding: "10px 0 3px",
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right: + Load (amber, no border) */}
        <Link
          href="/new"
          prefetch={true}
          onClick={() => haptics.medium()}
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#1a1a1a",
            textDecoration: "none",
            padding: "6px 14px",
            backgroundColor: "var(--accent)",
            borderRadius: 3,
          }}
        >
          + Load
        </Link>
      </div>
    </nav>
  );
}
