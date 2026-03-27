"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import { haptics } from "@/lib/haptics";

export default function AppleSettingsClient({ linked }: { linked: boolean }) {
  const router = useRouter();
  const [unlinking, setUnlinking] = useState(false);

  async function handleUnlink() {
    setUnlinking(true);
    const resp = await fetch("/api/auth/apple/link", { method: "DELETE" });
    if (resp.ok) {
      haptics.success();
      router.refresh();
    } else {
      haptics.error();
    }
    setUnlinking(false);
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px", borderBottom: "1px solid var(--border)" }}>
        <BackButton label="···" />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-primary)" }}>Apple ID</span>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ borderTop: "1px solid var(--border)", marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
          <span style={{ fontSize: 13, color: "var(--text-primary)" }}>Status</span>
          <span style={{ fontSize: 11, color: linked ? "var(--accent)" : "var(--text-tertiary)" }}>
            {linked ? "Connected" : "Not connected"}
          </span>
        </div>
      </div>

      {linked ? (
        <div style={{ padding: "24px 20px" }}>
          <button
            onClick={handleUnlink}
            disabled={unlinking}
            style={{
              width: "100%", padding: "11px 0", fontSize: 13, fontWeight: 600,
              color: "#c2410c", background: "none", border: "1px solid #c2410c",
              borderRadius: 8, cursor: "pointer", opacity: unlinking ? 0.5 : 1,
              fontFamily: "inherit",
            }}
          >
            {unlinking ? "Unlinking…" : "Unlink Apple ID"}
          </button>
        </div>
      ) : (
        <p style={{ fontSize: 12, color: "var(--text-tertiary)", padding: "16px 20px", lineHeight: 1.5 }}>
          Link your Apple ID from the iOS app under Settings → Apple ID.
        </p>
      )}
    </div>
  );
}
