"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { startAuthentication } from "@simplewebauthn/browser";

function FilmIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-6 opacity-70">
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
    // Cancel autofill before starting explicit flow
    autofillAbortRef.current?.abort();
    setStep("passkey");
  }

  async function handlePasskeyLogin() {
    setError("");
    setLoading(true);

    try {
      // Step 1: Get authentication options from server
      const optionsResp = await fetch("/api/auth/webauthn/login-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      if (!optionsResp.ok) {
        const data = await optionsResp.json();
        throw new Error(data.error || "Failed to start login");
      }

      const { options: optionsJSON, challenge, userId } = await optionsResp.json();

      // Step 2: Prompt user for passkey (Face ID, Touch ID, security key)
      const response = await startAuthentication({ optionsJSON });

      // Step 3: Verify authentication with server
      const verifyResp = await fetch("/api/auth/webauthn/login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response, challenge, user_id: userId }),
      });

      if (!verifyResp.ok) {
        const data = await verifyResp.json();
        throw new Error(data.error || "Failed to complete login");
      }

      // Full page navigation so session cookie is sent on the next request
      window.location.href = searchParams.get("from") ?? "/";
    } catch (err: any) {
      console.error("Login error:", err);

      if (err.name === "NotAllowedError") {
        setError("Login cancelled. Please try again.");
      } else if (err.name === "NotSupportedError") {
        setError("Your device doesn't support passkeys. Try using a different device or browser.");
      } else if (err.message?.includes("not found")) {
        setError("Account not found. Please check your email or username.");
      } else {
        setError(err.message || "Failed to sign in. Please try again.");
      }

      if (err.message?.includes("not found")) {
        setStep("identifier");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-xs">

        {/* Header */}
        <div className="text-center mb-12">
          <FilmIcon />
          <h1 className="text-2xl font-bold tracking-[0.3em] uppercase mb-1">Rolls</h1>
          <p className="text-[10px] tracking-widest uppercase text-zinc-400">
            {step === "identifier" ? "Sign In" : "Passkey"}
          </p>
        </div>

        {/* Step 1: Enter email or username */}
        {step === "identifier" && (
          <form onSubmit={handleIdentifierSubmit} className="space-y-8">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-widest text-zinc-400">
                Email or Username
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value.trim())}
                required
                autoFocus
                autoComplete="username webauthn"
                className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white py-2 text-base focus:outline-none transition-colors"
              />
            </div>
            {error && <p className="text-red-400 text-xs tracking-wide text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading || !identifier}
              className="w-full border border-zinc-900 dark:border-white text-zinc-900 dark:text-white py-3 text-xs tracking-widest uppercase font-medium hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Checking..." : "Continue"}
            </button>
          </form>
        )}

        {/* Step 2: Passkey authentication */}
        {step === "passkey" && (
          <div className="space-y-8">
            <div className="text-center space-y-1">
              <p className="font-medium tracking-wide">{identifier}</p>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400">Ready to authenticate</p>
            </div>
            {error && <p className="text-red-400 text-xs tracking-wide text-center">{error}</p>}
            <button
              onClick={handlePasskeyLogin}
              disabled={loading}
              className="w-full border border-zinc-900 dark:border-white text-zinc-900 dark:text-white py-3 text-xs tracking-widest uppercase font-medium hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In with Passkey"}
            </button>
            <button
              onClick={() => {
                setStep("identifier");
                setError("");
              }}
              disabled={loading}
              className="w-full text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white py-2 transition-colors"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Help text */}
        <div className="mt-12 text-center">
          <button
            onClick={() => router.push("/register")}
            className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            No account? Get an invite
          </button>
        </div>

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
