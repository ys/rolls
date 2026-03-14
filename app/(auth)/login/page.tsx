"use client";

import { useState, useEffect, useRef, Suspense } from "react";
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
  const autofillAbortRef = useRef<AbortController | null>(null);

  // Start conditional UI (passkey autofill) on mount
  useEffect(() => {
    const abort = new AbortController();
    autofillAbortRef.current = abort;

    async function startAutofill() {
      try {
        const resp = await fetch("/api/auth/webauthn/autofill-options", { method: "POST" });
        if (!resp.ok || abort.signal.aborted) return;
        const { options: optionsJSON, challenge } = await resp.json();

        // useBrowserAutofill=true: passkey appears in the email input's autocomplete
        const response = await startAuthentication({ optionsJSON, useBrowserAutofill: true });
        if (abort.signal.aborted) return;

        const verifyResp = await fetch("/api/auth/webauthn/login-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ response, challenge }),
        });

        if (verifyResp.ok) {
          window.location.href = searchParams.get("from") ?? "/";
        }
      } catch {
        // Silently ignore — user dismissed autofill or browser doesn't support it
      }
    }

    startAutofill();

    return () => {
      abort.abort();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleIdentifierSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Cancel autofill before starting explicit flow, then trigger passkey immediately
    autofillAbortRef.current?.abort();
    handlePasskeyLogin();
  }

  async function handlePasskeyLogin() {
    setError("");
    setLoading(true);

    try {
      // Use discoverable-credential flow (empty allowCredentials) — same as autofill.
      // This avoids Safari showing a QR code when stored credential IDs don't exactly
      // match the browser's keychain (e.g. cross-device sync lag, re-registration).
      autofillAbortRef.current?.abort();
      const optionsResp = await fetch("/api/auth/webauthn/autofill-options", { method: "POST" });
      if (!optionsResp.ok) throw new Error("Failed to start login");
      const { options: optionsJSON, challenge } = await optionsResp.json();

      // Prompt user for passkey (Face ID, Touch ID, security key)
      const response = await startAuthentication({ optionsJSON });

      // Verify — no user_id needed, server looks up by credential ID
      const verifyResp = await fetch("/api/auth/webauthn/login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response, challenge }),
      });

      if (!verifyResp.ok) {
        const data = await verifyResp.json();
        throw new Error(data.error || "Failed to complete login");
      }

      window.location.href = searchParams.get("from") ?? "/";
    } catch (err: any) {
      console.error("Login error:", err);

      if (err.name === "NotAllowedError") {
        setError("Login cancelled. Please try again.");
      } else if (err.name === "NotSupportedError") {
        setError("Your device doesn't support passkeys. Try using a different device or browser.");
      } else {
        setError(err.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

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
          Sign In
        </div>
      </div>

      {/* Content section */}
      <div style={{ padding: "0 28px 48px" }}>
        <form onSubmit={handleIdentifierSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 9,
                  color: "rgba(244,241,234,0.5)",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Email or Username
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value.trim())}
                required
                autoFocus
                autoComplete="username webauthn"
                style={{
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
                }}
              />
            </div>
            {error && (
              <p
                style={{
                  fontSize: 11,
                  color: "#fca5a5",
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !identifier}
              style={{
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
                opacity: loading || !identifier ? 0.4 : 1,
              }}
            >
              {loading ? "Checking..." : "Continue"}
            </button>
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <button
                type="button"
                onClick={handlePasskeyLogin}
                disabled={loading}
                style={{
                  fontSize: 9,
                  color: "rgba(244,241,234,0.5)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  padding: "8px 0",
                }}
              >
                Sign in with passkey directly
              </button>
            </div>
            <div style={{ marginTop: 8, textAlign: "center" }}>
              <button
                type="button"
                onClick={() => router.push("/register")}
                style={{
                  fontSize: 9,
                  color: "rgba(244,241,234,0.3)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                No account? Get an invite
              </button>
            </div>
          </form>
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
