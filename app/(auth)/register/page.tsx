"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { startRegistration } from "@simplewebauthn/browser";

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

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("invite") ?? "";

  const [step, setStep] = useState<"invite" | "details" | "passkey">("invite");
  const [invite, setInvite] = useState(inviteCode);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsInvite, setNeedsInvite] = useState(true);

  // Check if this is a bootstrap registration (no users exist yet)
  useEffect(() => {
    fetch("/api/auth/bootstrap")
      .then((r) => r.json())
      .then(({ needsInvite: ni }) => {
        setNeedsInvite(ni);
        if (!ni) setStep("details");
      })
      .catch(() => {}); // keep needsInvite=true on error (safe default)
  }, []);

  // If invite is in URL, validate it and move to details step
  useEffect(() => {
    if (inviteCode) {
      validateInvite(inviteCode);
    }
  }, [inviteCode]);

  async function validateInvite(code: string) {
    if (!code) return;

    setLoading(true);
    setError("");

    try {
      const resp = await fetch(`/api/auth/invites/validate?code=${encodeURIComponent(code)}`);

      if (resp.ok) {
        setInvite(code);
        setStep("details");
      } else {
        const data = await resp.json();
        setError(data.error || "Invalid invite code");
      }
    } catch (err) {
      setError("Failed to validate invite code");
    } finally {
      setLoading(false);
    }
  }

  async function handleInviteSubmit(e: React.FormEvent) {
    e.preventDefault();
    await validateInvite(invite);
  }

  async function checkUsername(username: string) {
    if (username.length < 3) return false;

    const resp = await fetch("/api/auth/check-username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, invite_code: invite }),
    });
    const data = await resp.json();
    return data.available;
  }

  async function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate inputs
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      setLoading(false);
      return;
    }

    // Check if username is available
    const available = await checkUsername(username);
    if (!available) {
      setError("Username is already taken");
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep("passkey");
  }

  async function handlePasskeyRegistration() {
    setError("");
    setLoading(true);

    try {
      // Step 1: Get registration options from server
      const optionsResp = await fetch("/api/auth/webauthn/register-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, name, invite_code: invite }),
      });

      if (!optionsResp.ok) {
        const data = await optionsResp.json();
        throw new Error(data.error || "Failed to start registration");
      }

      const { options: optionsJSON, challenge } = await optionsResp.json();

      // Step 2: Prompt user for passkey (Face ID, Touch ID, security key)
      const response = await startRegistration({ optionsJSON });

      // Step 3: Verify registration with server
      const verifyResp = await fetch("/api/auth/webauthn/register-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username,
          name,
          invite_code: invite,
          response,
          challenge,
        }),
      });

      if (!verifyResp.ok) {
        const data = await verifyResp.json();
        throw new Error(data.error || "Failed to complete registration");
      }

      // Full page navigation so session cookie is sent on the next request
      window.location.href = "/";
    } catch (err: any) {
      console.error("Registration error:", err);

      // User-friendly error messages
      if (err.name === "NotAllowedError") {
        setError("Registration cancelled. Please try again.");
      } else if (err.name === "NotSupportedError") {
        setError("Your device doesn't support passkeys. Try using a different device or browser.");
      } else {
        setError(err.message || "Failed to register. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const stepLabel: Record<typeof step, string> = {
    invite: "Invite",
    details: "Create Account",
    passkey: "Passkey",
  };

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

  const primaryButtonStyle: React.CSSProperties = {
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

  const dimButtonStyle: React.CSSProperties = {
    fontSize: 9,
    color: "rgba(244,241,234,0.4)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Top section — branding */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <FilmIcon />
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#f4f1ea",
          }}
        >
          ROLLS
        </div>
        <div
          style={{
            width: 40,
            height: 1,
            background: "rgba(244,241,234,0.2)",
            margin: "8px 0",
          }}
        />
        <div
          style={{
            fontSize: 9,
            color: "rgba(244,241,234,0.5)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          {stepLabel[step]}
        </div>
      </div>

      {/* Content section */}
      <div style={{ overflowY: "auto", padding: "0 28px 48px" }}>
        {/* Step 1: Invite Code */}
        {step === "invite" && (
          <form onSubmit={handleInviteSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Invite Code</label>
              <input
                type="text"
                value={invite}
                onChange={(e) => setInvite(e.target.value.trim())}
                required
                autoFocus
                style={inputStyle}
              />
            </div>
            {error && (
              <p style={{ fontSize: 11, color: "#fca5a5", textAlign: "center", marginBottom: 8 }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !invite}
              style={{ ...primaryButtonStyle, opacity: loading || !invite ? 0.4 : 1 }}
            >
              {loading ? "Validating..." : "Continue"}
            </button>
            {needsInvite && (
              <div style={{ marginTop: 24, textAlign: "center" }}>
                <p style={{ fontSize: 9, color: "rgba(244,241,234,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Contact the admin for an invite
                </p>
              </div>
            )}
          </form>
        )}

        {/* Step 2: User Details */}
        {step === "details" && (
          <form onSubmit={handleDetailsSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                required
                autoFocus
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.trim().toLowerCase())}
                required
                pattern="[a-z0-9_-]{3,}"
                title="Lowercase letters, numbers, dashes, and underscores only (min 3 characters)"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Display Name <span style={{ textTransform: "none" }}>(optional)</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
              />
            </div>
            {error && (
              <p style={{ fontSize: 11, color: "#fca5a5", textAlign: "center", marginBottom: 8 }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !email || !username}
              style={{ ...primaryButtonStyle, opacity: loading || !email || !username ? 0.4 : 1 }}
            >
              {loading ? "Checking..." : "Continue"}
            </button>
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <button type="button" onClick={() => router.push("/login")} style={dimButtonStyle}>
                Already have an account? Sign in
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Passkey Registration */}
        {step === "passkey" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: "#f4f1ea", marginBottom: 4 }}>{email}</div>
              <div style={{ fontSize: 9, color: "rgba(244,241,234,0.5)", textTransform: "uppercase", letterSpacing: "0.14em" }}>
                @{username}
              </div>
              {name && (
                <div style={{ fontSize: 11, color: "rgba(244,241,234,0.5)", marginTop: 4 }}>{name}</div>
              )}
            </div>
            {error && (
              <p style={{ fontSize: 11, color: "#fca5a5", textAlign: "center", marginBottom: 8 }}>
                {error}
              </p>
            )}
            <button
              onClick={handlePasskeyRegistration}
              disabled={loading}
              style={{ ...primaryButtonStyle, opacity: loading ? 0.4 : 1 }}
            >
              {loading ? "Setting up..." : "Set Up Passkey"}
            </button>
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <button
                onClick={() => setStep("details")}
                disabled={loading}
                style={dimButtonStyle}
              >
                ← Back
              </button>
            </div>
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <button type="button" onClick={() => router.push("/login")} style={dimButtonStyle}>
                Already have an account? Sign in
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
