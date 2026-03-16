"use client";

import { useEffect, useState } from "react";

/**
 * Offline Indicator - Shows a banner when the app loses internet connection
 *
 * Features:
 * - Listens to online/offline events
 * - Auto-dismisses when connection is restored
 * - Slide-down animation
 * - Native-looking amber warning banner
 */
export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [syncingCount, setSyncingCount] = useState(0);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    function handleOnline() {
      setIsOffline(false);
      setTimeout(() => setShowBanner(false), 2000);
    }

    function handleOffline() {
      setIsOffline(true);
      setShowBanner(true);
    }

    function handleSwMessage(event: MessageEvent) {
      if (event.data?.type === "SYNC_STATUS") {
        setSyncingCount(event.data.count ?? 0);
        if (event.data.count > 0) setShowBanner(true);
        else setTimeout(() => setShowBanner(false), 2000);
      }
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    navigator.serviceWorker?.addEventListener("message", handleSwMessage);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      navigator.serviceWorker?.removeEventListener("message", handleSwMessage);
    };
  }, []);

  useEffect(() => {
    if (isOffline) setShowBanner(true);
  }, [isOffline]);

  if (!showBanner) return null;

  return (
    <div
      className={`fixed top-0 inset-x-0 z-50 transition-transform duration-300 ${
        showBanner ? "translate-y-0" : "-translate-y-full"
      }`}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div
        className={`px-4 py-3 text-center text-sm font-medium ${
          isOffline
            ? "bg-amber-500 dark:bg-amber-600 text-white"
            : syncingCount > 0
            ? "bg-blue-500 dark:bg-blue-600 text-white"
            : "bg-green-500 dark:bg-green-600 text-white"
        }`}
      >
        {isOffline ? (
          <>
            <span className="mr-2">📡</span>
            You&apos;re offline. Changes will sync when connected.
          </>
        ) : syncingCount > 0 ? (
          <>
            <span className="mr-2">⏳</span>
            Syncing {syncingCount} roll{syncingCount > 1 ? "s" : ""}...
          </>
        ) : (
          <>
            <span className="mr-2">✓</span>
            Connected
          </>
        )}
      </div>
    </div>
  );
}
