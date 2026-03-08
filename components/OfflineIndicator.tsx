"use client";

import { useEffect, useState } from "react";

/**
 * Offline Indicator - Shows a banner when the app loses internet connection
 *
 * Features:
 * - Listens to online/offline events
 * - Auto-dismisses when connection is restored
 * - Slide-down animation
 * - Native-looking kodak warning banner
 */
export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOffline(!navigator.onLine);

    function handleOnline() {
      setIsOffline(false);
      // Delay hiding banner to show "Connected" message briefly
      setTimeout(() => setShowBanner(false), 2000);
    }

    function handleOffline() {
      setIsOffline(true);
      setShowBanner(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Show banner when offline
  useEffect(() => {
    if (isOffline) {
      setShowBanner(true);
    }
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
            ? "bg-kodak-500 dark:bg-kodak-600 text-white"
            : "bg-green-500 dark:bg-green-600 text-white"
        }`}
      >
        {isOffline ? (
          <>
            <span className="mr-2">📡</span>
            You're offline. Changes will sync when connected.
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
