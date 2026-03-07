"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { startAuthentication } from "@simplewebauthn/browser";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"identifier" | "passkey">("identifier");

  async function handleIdentifierSubmit(e: React.FormEvent) {
    e.preventDefault();
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

      // User-friendly error messages
      if (err.name === "NotAllowedError") {
        setError("Login cancelled. Please try again.");
      } else if (err.name === "NotSupportedError") {
        setError("Your device doesn't support passkeys. Try using a different device or browser.");
      } else if (err.message?.includes("not found")) {
        setError("Account not found. Please check your email or username.");
      } else {
        setError(err.message || "Failed to sign in. Please try again.");
      }

      // Go back to identifier step if user not found
      if (err.message?.includes("not found")) {
        setStep("identifier");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-8">Sign In to Rolls</h1>

        {/* Step 1: Enter email or username */}
        {step === "identifier" && (
          <form onSubmit={handleIdentifierSubmit} className="space-y-4">
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value.trim())}
              placeholder="Email or username"
              required
              autoFocus
              autoComplete="username webauthn"
              className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20"
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading || !identifier}
              className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black py-4 rounded-xl font-semibold active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100"
            >
              {loading ? "Checking..." : "Continue"}
            </button>
          </form>
        )}

        {/* Step 2: Passkey authentication */}
        {step === "passkey" && (
          <div className="space-y-4">
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">
              Use your passkey to sign in
            </p>
            <div className="text-center mb-6">
              <p className="font-medium">{identifier}</p>
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              onClick={handlePasskeyLogin}
              disabled={loading}
              className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black py-4 rounded-xl font-semibold active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100"
            >
              {loading ? "Signing in..." : "Sign In with Passkey"}
            </button>
            <button
              onClick={() => {
                setStep("identifier");
                setError("");
              }}
              disabled={loading}
              className="w-full text-zinc-600 dark:text-zinc-400 py-2 text-sm"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Help text */}
        <p className="text-center text-sm text-zinc-500 mt-6">
          <button
            onClick={() => router.push("/register")}
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            Don't have an account? Get an invite
          </button>
        </p>
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
