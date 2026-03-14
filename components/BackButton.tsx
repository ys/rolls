"use client";

import { useRouter } from "next/navigation";
import { haptics } from "@/lib/haptics";

export default function BackButton({
  label = "Back",
  onClick,
}: {
  label?: string;
  onClick?: () => void;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        haptics.light();
        onClick ? onClick() : router.back();
      }}
      style={{
        fontSize: 24,
        color: "var(--text-primary)",
        background: "none",
        border: "none",
        cursor: "pointer",
        lineHeight: 1,
        padding: "0 8px 0 0",
        fontFamily: "inherit",
        opacity: 1,
      }}
    >
      ‹
    </button>
  );
}
