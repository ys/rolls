"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { startAuthentication } from "@simplewebauthn/browser";

function FilmIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 32 32" fill="none" style={{ color: "#f4f1ea" }}>
      <rect x="1" y="5" width="30" height="22" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1" y="9" width="4" height="4" fill="currentColor" />
      <rect x="1" y="15" width="4" height="4" fill="currentColor" />
      <rect x="1" y="21" width="4" height="4" fill="currentColor" />
      <rect x="27" y="9" width="4" height="4" fill="currentColor" />
      <rect x="27" y="15" width="4" height="4" fill="currentColor" />
      <rect x="27" y="21" width="4" height="4" fill="currentColor" />
      <rect x="8" y="9" width="16" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"identifier" | "passkey">("identifier");
  const [pendingOptions, setPendingOptions] = useState<{ optionsJSON: any; challenge: string; userId: string } | null>(null);

  // Called when identifier form is submitted — fetches options AND immediately starts WebAuthn
  async function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 1: resolve user + get credential options
      const resp = await fetch("/api/auth/webauthn/login-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.error || "Account not found");
      }

      const { options: optionsJSON, challenge, user_id: userId } = await resp.json();
      setPendingOptions({ optionsJSON, challenge, userId });
      setStep("passkey");

      // Step 2: immediately trigger passkey prompt (no extra click needed)
      await signInWithPasskey(optionsJSON, challenge, userId);
    } catch (err: any) {
      setLoading(false);
      if (err.name === "NotAllowedError") {
        // User dismissed — stay on passkey step so they can retry
        setError("Cancelled. Tap the button to try again.");
      } else if (err.message?.includes("not found") || err.message?.includes("Account")) {
        setStep("identifier");
        setPendingOptions(null);
        setError(err.message);
      } else if (err.name === "NotSupportedError") {
        setError("Your device doesn't support passkeys.");
      } else {
        setError(err.message || "Sign in failed. Please try again.");
      }
    }
  }

  // Re-trigger passkey prompt from the passkey step (after dismiss)
  async function handleRetry() {
    if (!pendingOptions) return;
    setError("");
    setLoading(true);
    try {
      await signInWithPasskey(pendingOptions.optionsJSON, pendingOptions.challenge, pendingOptions.userId);
    } catch (err: any) {
      setLoading(false);
      if (err.name === "NotAllowedError") {
        setError("Cancelled. Tap the button to try again.");
      } else {
        setError(err.message || "Sign in failed. Please try again.");
      }
    }
  }

  async function signInWithPasskey(optionsJSON: any, challenge: string, userId: string) {
    const response = await startAuthentication({ optionsJSON });

    const verifyResp = await fetch("/api/auth/webauthn/login-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response, challenge, user_id: userId }),
    });

    if (!verifyResp.ok) {
      const data = await verifyResp.json();
      throw new Error(data.error || "Verification failed");
    }

    window.location.href = searchParams.get("from") ?? "/";
  }

  const inputStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    borderBottom: "1px solid rgba(244,241,234,0.3)",
    padding: "10px 0",
    fontSize: 14,
    color: "#f4f1ea",
    caretColor: "#f4f1ea",
    fontFamily: "inherit",
    outline: "none",
    width: "100%",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 9,
    color: "rgba(244,241,234,0.5)",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    marginBottom: 6,
  };

  const ctaStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 0",
    backgroundColor: "#f4f1ea",
    color: "#7c2d12",
    border: "none",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    fontFamily: "inherit",
    cursor: "pointer",
  };

  const dimBtnStyle: React.CSSProperties = {
    fontSize: 9,
    color: "rgba(244,241,234,0.4)",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Branding */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <FilmIcon />
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#f4f1ea" }}>
          ROLLS
        </div>
        <div style={{ width: 40, height: 1, background: "rgba(244,241,234,0.2)", margin: "8px 0" }} />
        <div style={{ fontSize: 9, color: "rgba(244,241,234,0.5)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          {step === "identifier" ? "Sign In" : "Passkey"}
        </div>
      </div>

      {/* Form */}
      <div style={{ padding: "0 28px 48px" }}>
        {step === "identifier" && (
          <form onSubmit={handleContinue}>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Email or Username</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value.trim())}
                required
                autoFocus
                autoComplete="username webauthn"
                style={inputStyle}
              />
            </div>
            {error && (
              <p style={{ fontSize: 11, color: "#fca5a5", textAlign: "center", marginBottom: 8 }}>{error}</p>
            )}
            <button type="submit" disabled={loading || !identifier} style={{ ...ctaStyle, opacity: loading || !identifier ? 0.4 : 1 }}>
              {loading ? "Checking…" : "Continue"}
            </button>
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <button type="button" onClick={() => router.push("/register")} style={dimBtnStyle}>
                No account? Get an invite
              </button>
            </div>
          </form>
        )}

        {step === "passkey" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: "#f4f1ea", marginBottom: 4 }}>{identifier}</div>
              <div style={{ fontSize: 9, color: "rgba(244,241,234,0.5)", textTransform: "uppercase", letterSpacing: "0.14em" }}>
                {loading ? "Waiting for passkey…" : "Ready to authenticate"}
              </div>
            </div>
            {error && (
              <p style={{ fontSize: 11, color: "#fca5a5", textAlign: "center", marginBottom: 8 }}>{error}</p>
            )}
            {!loading && (
              <button onClick={handleRetry} style={ctaStyle}>
                Sign In with Passkey
              </button>
            )}
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <button
                onClick={() => { setStep("identifier"); setError(""); setPendingOptions(null); }}
                disabled={loading}
                style={dimBtnStyle}
              >
                ← Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
