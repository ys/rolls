"use client";

import { useEffect, useState } from "react";

const FONTS = [
  { id: "ia-writer-mono",  name: "iA Writer Mono",  stack: '"iA Writer Mono", ui-monospace, monospace',  url: null },
  { id: "departure-mono",  name: "Departure Mono",   stack: '"Departure Mono", ui-monospace, monospace',  url: "https://fonts.googleapis.com/css2?family=Departure+Mono&display=swap" },
  { id: "dm-mono",         name: "DM Mono",          stack: '"DM Mono", ui-monospace, monospace',         url: "https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap" },
  { id: "commit-mono",     name: "Commit Mono",      stack: '"Commit Mono", ui-monospace, monospace',     url: null },
  { id: "geist-mono",      name: "Geist Mono",       stack: '"Geist Mono", ui-monospace, monospace',      url: null },
  { id: "input-mono",      name: "Input Mono",       stack: '"Input Mono", ui-monospace, monospace',      url: null },
] as const;

const STORAGE_KEY = "app-font";
const DEFAULT_FONT = FONTS[0];

function loadGoogleFont(url: string) {
  if (document.querySelector(`link[href="${url}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

export default function FontPicker() {
  const [current, setCurrent] = useState(DEFAULT_FONT.id);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const font = FONTS.find((f) => f.stack === saved);
      if (font) {
        setCurrent(font.id);
        if (font.url) loadGoogleFont(font.url);
      }
    }
  }, []);

  function select(font: typeof FONTS[number]) {
    if (font.url) loadGoogleFont(font.url);
    document.documentElement.style.setProperty("--app-font", font.stack);
    if (font.id === DEFAULT_FONT.id) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, font.stack);
    }
    setCurrent(font.id);
  }

  return (
    <li>
      <div className="px-4 py-3.5 space-y-3">
        <p className="text-[15px]">Font</p>
        <div className="space-y-1">
          {FONTS.map((font) => (
            <button
              key={font.id}
              onClick={() => select(font)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left ${
                current === font.id
                  ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              <span className="text-[14px]" style={{ fontFamily: font.stack }}>{font.name}</span>
              {current === font.id && (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </li>
  );
}
