"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { haptics } from "../lib/haptics";

const SWIPE_THRESHOLD = 100; // Pixels to swipe before triggering back
const EDGE_THRESHOLD = 50; // Start swipe within this many pixels from left edge

/**
 * useSwipeBack Hook
 *
 * Enables iOS-style swipe-from-left-edge to go back navigation
 * Provides visual feedback and haptic response
 *
 * Usage:
 * ```
 * const { swipeProgress } = useSwipeBack();
 * ```
 */
export function useSwipeBack() {
  const router = useRouter();
  const [swipeProgress, setSwipeProgress] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwipingBack = useRef(false);

  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;

      // Only enable swipe if touch starts near left edge
      if (startX < EDGE_THRESHOLD) {
        touchStartX.current = startX;
        touchStartY.current = startY;
        isSwipingBack.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwipingBack.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = touch.clientY - touchStartY.current;

      // Only track horizontal swipes (prevent diagonal)
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        isSwipingBack.current = false;
        setSwipeProgress(0);
        return;
      }

      // Only swipe right (positive deltaX)
      if (deltaX > 0) {
        e.preventDefault();
        const progress = Math.min(deltaX / SWIPE_THRESHOLD, 1);
        setSwipeProgress(progress);

        // Haptic feedback when threshold reached
        if (progress >= 1 && deltaX < SWIPE_THRESHOLD + 10) {
          haptics.light();
        }
      }
    };

    const handleTouchEnd = () => {
      if (!isSwipingBack.current) return;

      if (swipeProgress >= 1) {
        // Trigger back navigation
        haptics.medium();
        router.back();
      }

      // Reset state
      isSwipingBack.current = false;
      setSwipeProgress(0);
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [router, swipeProgress]);

  return { swipeProgress };
}
