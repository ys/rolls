"use client";

import { useRouter } from "next/navigation";
import { haptics } from "@/lib/haptics";
import { ChevronLeft } from "pixelarticons/react/ChevronLeft";

export default function BackButton({ label = "Back" }: { label?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => { haptics.light(); router.back(); }}
      className="flex items-center gap-0.5 text-amber-500 dark:text-amber-400 font-semibold text-[17px] active:opacity-40 transition-opacity -ml-1 mb-4"
    >
      <ChevronLeft width={20} height={20} className="shrink-0" />
      <span>{label}</span>
    </button>
  );
}
