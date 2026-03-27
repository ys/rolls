"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import { haptics } from "@/lib/haptics";

const APPLE_WEB_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_WEB_CLIENT_ID;

export default function AppleSettingsClient({ linked }: { linked: boolean }) {
  const router = useRouter();
  const [unlinking, setUnlinking] = useState(false);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState("");
  const [appleReady, setAppleReady] = useState(false);

  useEffect(() => {
    if (!APPLE_WEB_CLIENT_ID) return;
    const script = document.createElement("script");
    script.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    script.onload = () => {
      (window as any).AppleID.auth.init({
        clientId: APPLE_WEB_CLIENT_ID,
        scope: "name email",
        redirectURI: window.location.origin + "/settings/apple",
        usePopup: true,
      });
      setAppleReady(true);
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  async function handleLink() {
    setError("");
    setLinking(true);
    try {
      const data = await (window as any).AppleID.auth.signIn();
      const token = data.authorization.id_token;

      const resp = await fetch("/api/auth/apple/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity_token: token }),
      });

      if (resp.ok) {
        haptics.success();
        router.refresh();
      } else {
        const body = await resp.json();
        setError(body.error || "Failed to link Apple ID");
        haptics.error();
      }
    } catch (err: any) {
      if (err?.error !== "popup_closed_by_user") {
        setError("Apple sign in failed. Please try again.");
        haptics.error();
      }
    } finally {
      setLinking(false);
    }
  }

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

      <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {error && (
          <p style={{ fontSize: 11, color: "#fca5a5", margin: 0 }}>{error}</p>
        )}
        {!linked && APPLE_WEB_CLIENT_ID && (
          <button
            onClick={handleLink}
            disabled={linking || !appleReady}
            style={{
              width: "100%", padding: "11px 0", fontSize: 13, fontWeight: 600,
              color: "var(--text-primary)", background: "none", border: "1px solid var(--border)",
              borderRadius: 8, cursor: "pointer", opacity: linking || !appleReady ? 0.5 : 1,
              fontFamily: "inherit",
            }}
          >
            {linking ? "Waiting for Apple…" : "Link Apple ID"}
          </button>
        )}
        {!linked && !APPLE_WEB_CLIENT_ID && (
          <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: 0, lineHeight: 1.5 }}>
            Link your Apple ID from the iOS app under Settings → Apple ID.
          </p>
        )}
        {linked && (
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
        )}
      </div>
    </div>
  );
}
