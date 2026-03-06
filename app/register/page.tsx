"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { startRegistration } from "@simplewebauthn/browser";

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

    const resp = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
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
        body: JSON.stringify({ email, username, name, inviteCode: invite }),
      });

      if (!optionsResp.ok) {
        const data = await optionsResp.json();
        throw new Error(data.error || "Failed to start registration");
      }

      const options = await optionsResp.json();

      // Step 2: Prompt user for passkey (Face ID, Touch ID, security key)
      const credential = await startRegistration({ optionsJSON: options });

      // Step 3: Verify registration with server
      const verifyResp = await fetch("/api/auth/webauthn/register-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username,
          name,
          inviteCode: invite,
          credential,
        }),
      });

      if (!verifyResp.ok) {
        const data = await verifyResp.json();
        throw new Error(data.error || "Failed to complete registration");
      }

      // Registration successful! Redirect to home
      router.push("/");
      router.refresh();
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-8">
          {step === "invite" && "Enter Invite Code"}
          {step === "details" && "Create Account"}
          {step === "passkey" && "Set Up Passkey"}
        </h1>

        {/* Step 1: Invite Code */}
        {step === "invite" && (
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <input
              type="text"
              value={invite}
              onChange={(e) => setInvite(e.target.value.trim())}
              placeholder="Invite code"
              required
              autoFocus
              className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20"
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading || !invite}
              className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black py-4 rounded-xl font-semibold active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100"
            >
              {loading ? "Validating..." : "Continue"}
            </button>
          </form>
        )}

        {/* Step 2: User Details */}
        {step === "details" && (
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              placeholder="Email"
              required
              autoFocus
              className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20"
            />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim().toLowerCase())}
              placeholder="Username"
              required
              pattern="[a-z0-9_-]{3,}"
              title="Lowercase letters, numbers, dashes, and underscores only (min 3 characters)"
              className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20"
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Display name (optional)"
              className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20"
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading || !email || !username}
              className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black py-4 rounded-xl font-semibold active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100"
            >
              {loading ? "Checking..." : "Continue"}
            </button>
          </form>
        )}

        {/* Step 3: Passkey Registration */}
        {step === "passkey" && (
          <div className="space-y-4">
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">
              Use Face ID, Touch ID, or a security key to secure your account. No password needed!
            </p>
            <div className="text-center space-y-2 mb-6">
              <p className="font-medium">{email}</p>
              <p className="text-sm text-zinc-500">@{username}</p>
              {name && <p className="text-sm text-zinc-500">{name}</p>}
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              onClick={handlePasskeyRegistration}
              disabled={loading}
              className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black py-4 rounded-xl font-semibold active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100"
            >
              {loading ? "Setting up..." : "Set Up Passkey"}
            </button>
            <button
              onClick={() => setStep("details")}
              disabled={loading}
              className="w-full text-zinc-600 dark:text-zinc-400 py-2 text-sm"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Help text */}
        <p className="text-center text-sm text-zinc-500 mt-6">
          {step === "invite" && "Don't have an invite? Contact the admin."}
          {(step === "details" || step === "passkey") && (
            <button
              onClick={() => router.push("/login")}
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              Already have an account? Sign in
            </button>
          )}
        </p>
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
