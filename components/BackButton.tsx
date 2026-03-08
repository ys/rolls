"use client";

import { useRouter } from "next/navigation";
import { haptics } from "@/lib/haptics";

export default function BackButton({ label = "Back" }: { label?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => { haptics.light(); router.back(); }}
      className="flex items-center gap-0.5 text-amber-500 dark:text-amber-400 font-semibold text-[17px] active:opacity-40 transition-opacity -ml-1 mb-4"
    >
      <svg
        width="12" height="20" viewBox="0 0 12 20"
        fill="none" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
        className="shrink-0"
      >
        <path d="M10 2L2 10l8 8" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
