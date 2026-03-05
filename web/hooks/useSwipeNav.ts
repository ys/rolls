"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { haptics } from "../lib/haptics";

const SWIPE_THRESHOLD = 80; // Pixels to swipe before triggering navigation
const VERTICAL_TOLERANCE = 50; // Max vertical movement allowed for horizontal swipe

/**
 * useSwipeNav Hook
 *
 * Enables iOS/Android-style swipe left/right to navigate between tabs
 * Works with the bottom navigation tabs
 *
 * Usage:
 * ```
 * useSwipeNav();
 * ```
 */
export function useSwipeNav() {
  const router = useRouter();
  const pathname = usePathname();
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);

  useEffect(() => {
    // Tab routes in order
    const tabs = ["/", "/cameras", "/films", "/stats"];

    // Find current tab index
    const getCurrentTabIndex = () => {
      const index = tabs.findIndex(tab => {
        if (tab === "/") return pathname === "/";
        return pathname.startsWith(tab);
      });
      return index === -1 ? 0 : index;
    };

    const handleTouchStart = (e: TouchEvent) => {
      // Don't intercept swipes on form elements
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.closest("form")
      ) {
        return;
      }

      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
      isSwiping.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = touch.clientY - touchStartY.current;

      // Cancel if too much vertical movement (likely scrolling)
      if (Math.abs(deltaY) > VERTICAL_TOLERANCE) {
        isSwiping.current = false;
        return;
      }

      // Check if swipe threshold reached
      if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
        const currentIndex = getCurrentTabIndex();

        if (deltaX > 0) {
          // Swipe right - go to previous tab
          if (currentIndex > 0) {
            haptics.light();
            router.push(tabs[currentIndex - 1]);
            isSwiping.current = false;
          }
        } else {
          // Swipe left - go to next tab
          if (currentIndex < tabs.length - 1) {
            haptics.light();
            router.push(tabs[currentIndex + 1]);
            isSwiping.current = false;
          }
        }
      }
    };

    const handleTouchEnd = () => {
      isSwiping.current = false;
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [router, pathname]);
}
