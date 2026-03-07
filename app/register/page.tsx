"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { startRegistration } from "@simplewebauthn/browser";

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

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-xs">

        {/* Header */}
        <div className="text-center mb-12">
          <FilmIcon />
          <h1 className="text-2xl font-bold tracking-[0.3em] uppercase mb-1">Rolls</h1>
          <p className="text-[10px] tracking-widest uppercase text-zinc-400">
            {stepLabel[step]}
          </p>
        </div>

        {/* Step 1: Invite Code */}
        {step === "invite" && (
          <form onSubmit={handleInviteSubmit} className="space-y-8">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-widest text-zinc-400">
                Invite Code
              </label>
              <input
                type="text"
                value={invite}
                onChange={(e) => setInvite(e.target.value.trim())}
                required
                autoFocus
                className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white py-2 text-base focus:outline-none transition-colors"
              />
            </div>
            {error && <p className="text-red-400 text-xs tracking-wide text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading || !invite}
              className="w-full border border-zinc-900 dark:border-white text-zinc-900 dark:text-white py-3 text-xs tracking-widest uppercase font-medium hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Validating..." : "Continue"}
            </button>
          </form>
        )}

        {/* Step 2: User Details */}
        {step === "details" && (
          <form onSubmit={handleDetailsSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-widest text-zinc-400">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  required
                  autoFocus
                  className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white py-2 text-base focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-widest text-zinc-400">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.trim().toLowerCase())}
                  required
                  pattern="[a-z0-9_-]{3,}"
                  title="Lowercase letters, numbers, dashes, and underscores only (min 3 characters)"
                  className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white py-2 text-base focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-widest text-zinc-400">
                  Display Name <span className="normal-case">(optional)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white py-2 text-base focus:outline-none transition-colors"
                />
              </div>
            </div>
            {error && <p className="text-red-400 text-xs tracking-wide text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading || !email || !username}
              className="w-full border border-zinc-900 dark:border-white text-zinc-900 dark:text-white py-3 text-xs tracking-widest uppercase font-medium hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Checking..." : "Continue"}
            </button>
          </form>
        )}

        {/* Step 3: Passkey Registration */}
        {step === "passkey" && (
          <div className="space-y-8">
            <div className="text-center space-y-1">
              <p className="font-medium tracking-wide">{email}</p>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400">@{username}</p>
              {name && <p className="text-xs text-zinc-500">{name}</p>}
            </div>
            <p className="text-xs text-center text-zinc-400 tracking-wide leading-relaxed">
              Use Face ID, Touch ID, or a security key to secure your account. No password needed.
            </p>
            {error && <p className="text-red-400 text-xs tracking-wide text-center">{error}</p>}
            <button
              onClick={handlePasskeyRegistration}
              disabled={loading}
              className="w-full border border-zinc-900 dark:border-white text-zinc-900 dark:text-white py-3 text-xs tracking-widest uppercase font-medium hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Setting up..." : "Set Up Passkey"}
            </button>
            <button
              onClick={() => setStep("details")}
              disabled={loading}
              className="w-full text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white py-2 transition-colors"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Help text */}
        <div className="mt-12 text-center">
          {step === "invite" && needsInvite && (
            <p className="text-[10px] uppercase tracking-widest text-zinc-400">
              Contact the admin for an invite
            </p>
          )}
          {(step === "details" || step === "passkey") && (
            <button
              onClick={() => router.push("/login")}
              className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Already have an account? Sign in
            </button>
          )}
        </div>

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
