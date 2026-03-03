"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Set cookie and redirect
    document.cookie = `rolls_auth=${encodeURIComponent(password)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Strict`;
    const from = searchParams.get("from") ?? "/";
    router.push(from);
    router.refresh();
    setError("Incorrect password");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-8">Rolls</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full bg-zinc-800 rounded-xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-white/20"
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-white text-black py-4 rounded-xl font-semibold active:scale-95 transition-transform"
          >
            Enter
          </button>
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
