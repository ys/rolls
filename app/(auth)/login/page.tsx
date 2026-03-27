"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { startAuthentication } from "@simplewebauthn/browser";

const APPLE_WEB_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_WEB_CLIENT_ID;

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

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.27.07 2.16.75 2.9.8.94-.19 1.83-.89 3.02-.95 1.27.05 2.47.5 3.3 1.5-2.97 1.76-2.45 5.7.6 6.96-.56 1.57-1.3 3.13-1.82 4.57zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

type Step = "identifier" | "passkey" | "apple-register";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("identifier");
  const [pendingOptions, setPendingOptions] = useState<{ optionsJSON: any; challenge: string; userId: string } | null>(null);

  // Apple register state
  const [appleToken, setAppleToken] = useState("");
  const [appleEmail, setAppleEmail] = useState("");
  const [appleFullName, setAppleFullName] = useState("");
  const [appleUsername, setAppleUsername] = useState("");
  const [appleInvite, setAppleInvite] = useState(searchParams.get("invite") ?? "");
  const [needsInvite, setNeedsInvite] = useState(true);
  const [appleReady, setAppleReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/bootstrap")
      .then((r) => r.json())
      .then(({ needsInvite: ni }) => setNeedsInvite(ni))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!APPLE_WEB_CLIENT_ID) return;
    const script = document.createElement("script");
    script.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    script.onload = () => {
      (window as any).AppleID.auth.init({
        clientId: APPLE_WEB_CLIENT_ID,
        scope: "name email",
        redirectURI: window.location.origin + "/login",
        usePopup: true,
      });
      setAppleReady(true);
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  // Called when identifier form is submitted — fetches options AND immediately starts WebAuthn
  async function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
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
    } catch (err: any) {
      setError(err.message || "Account not found. Please check your email or username.");
    } finally {
      setLoading(false);
    }
  }

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

  async function handleAppleSignIn() {
    setError("");
    setLoading(true);
    try {
      const data = await (window as any).AppleID.auth.signIn();
      const token = data.authorization.id_token;
      const firstName = data.user?.name?.firstName ?? "";
      const lastName = data.user?.name?.lastName ?? "";
      const fullName = [firstName, lastName].filter(Boolean).join(" ");
      await submitAppleToken(token, fullName);
    } catch (err: any) {
      setLoading(false);
      if (err?.error === "popup_closed_by_user") return;
      setError("Apple sign in failed. Please try again.");
    }
  }

  async function submitAppleToken(token: string, fullName?: string, username?: string, inviteCode?: string) {
    setLoading(true);
    setError("");
    try {
      const body: any = { identity_token: token };
      if (fullName) body.full_name = fullName;
      if (username) body.username = username;
      if (inviteCode) body.invite_code = inviteCode;

      const resp = await fetch("/api/auth/apple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await resp.json();

      if (resp.ok) {
        window.location.href = searchParams.get("from") ?? "/";
        return;
      }

      if (resp.status === 404 && data.error === "new_account_required") {
        setAppleToken(token);
        setAppleEmail(data.email ?? "");
        setStep("apple-register");
        return;
      }

      throw new Error(data.error || "Sign in failed");
    } catch (err: any) {
      setError(err.message || "Apple sign in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleAppleRegister(e: React.FormEvent) {
    e.preventDefault();
    await submitAppleToken(appleToken, appleFullName || undefined, appleUsername, needsInvite ? appleInvite : undefined);
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

  const appleButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px 0",
    backgroundColor: "transparent",
    color: "#f4f1ea",
    border: "1px solid rgba(244,241,234,0.25)",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    fontFamily: "inherit",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
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

  const stepLabel = step === "identifier" ? "Sign In" : step === "passkey" ? "Passkey" : "Create Account";

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
          {stepLabel}
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

            {APPLE_WEB_CLIENT_ID && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(244,241,234,0.1)" }} />
                  <span style={{ fontSize: 9, color: "rgba(244,241,234,0.3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>or</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(244,241,234,0.1)" }} />
                </div>
                <button
                  type="button"
                  onClick={handleAppleSignIn}
                  disabled={loading || !appleReady}
                  style={{ ...appleButtonStyle, opacity: loading || !appleReady ? 0.4 : 1 }}
                >
                  <AppleIcon />
                  Sign in with Apple
                </button>
              </>
            )}

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
                {loading ? "Waiting for passkey…" : "Tap to authenticate"}
              </div>
            </div>
            {error && (
              <p style={{ fontSize: 11, color: "#fca5a5", textAlign: "center", marginBottom: 8 }}>{error}</p>
            )}
            <button onClick={handleRetry} disabled={loading} style={{ ...ctaStyle, opacity: loading ? 0.4 : 1 }}>
              {loading ? "Waiting…" : "Sign In with Passkey"}
            </button>
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

        {step === "apple-register" && (
          <form onSubmit={handleAppleRegister}>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={appleEmail}
                readOnly
                style={{ ...inputStyle, opacity: 0.5 }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Username</label>
              <input
                type="text"
                value={appleUsername}
                onChange={(e) => setAppleUsername(e.target.value.trim().toLowerCase())}
                required
                autoFocus
                pattern="[a-z0-9_-]{3,20}"
                title="3-20 characters, lowercase letters, numbers, dashes, underscores"
                style={inputStyle}
              />
            </div>
            {needsInvite && (
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Invite Code</label>
                <input
                  type="text"
                  value={appleInvite}
                  onChange={(e) => setAppleInvite(e.target.value.trim())}
                  required
                  style={inputStyle}
                />
              </div>
            )}
            {error && (
              <p style={{ fontSize: 11, color: "#fca5a5", textAlign: "center", marginBottom: 8 }}>{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || !appleUsername || (needsInvite && !appleInvite)}
              style={{ ...ctaStyle, opacity: loading || !appleUsername || (needsInvite && !appleInvite) ? 0.4 : 1 }}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <button
                type="button"
                onClick={() => { setStep("identifier"); setError(""); }}
                disabled={loading}
                style={dimBtnStyle}
              >
                ← Back
              </button>
            </div>
          </form>
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
