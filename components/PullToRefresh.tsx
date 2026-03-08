"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { haptics } from "../lib/haptics";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

const PULL_THRESHOLD = 80; // Pixels to pull before triggering refresh
const MAX_PULL = 120; // Maximum pull distance

/**
 * Pull-to-Refresh Component
 *
 * Native-style pull gesture for refreshing data
 * Features:
 * - Touch-based pull detection
 * - Visual indicator with rotation
 * - Haptic feedback on trigger
 * - Smooth animations
 */
export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);

  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    // Only allow pull-to-refresh when scrolled to top
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
      setCanPull(true);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!canPull || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStartY.current;

    // Only pull down, not up
    if (distance > 0 && window.scrollY === 0) {
      // Prevent default scrolling behavior
      e.preventDefault();

      // Apply resistance curve (diminishing returns as you pull further)
      const resistedDistance = Math.min(
        distance * 0.5,
        MAX_PULL
      );

      setPullDistance(resistedDistance);

      // Haptic feedback when threshold is reached
      if (resistedDistance >= PULL_THRESHOLD && distance < PULL_THRESHOLD * 2) {
        haptics.medium();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!canPull || isRefreshing) return;

    // Trigger refresh if pulled past threshold
    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      haptics.success();

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      // Snap back if not pulled enough
      setPullDistance(0);
    }

    setCanPull(false);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [canPull, pullDistance, isRefreshing]);

  const indicatorOpacity = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const indicatorRotation = (pullDistance / PULL_THRESHOLD) * 360;
  const isTriggered = pullDistance >= PULL_THRESHOLD;

  return (
    <div ref={containerRef} className="relative">
      {/* Pull-to-refresh indicator */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 transition-all duration-200"
        style={{
          transform: `translateX(-50%) translateY(${pullDistance - 50}px)`,
          opacity: pullDistance > 0 ? indicatorOpacity : 0,
        }}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isRefreshing
              ? "bg-amber-500 dark:bg-amber-600"
              : isTriggered
              ? "bg-green-500 dark:bg-green-600"
              : "bg-zinc-300 dark:bg-zinc-700"
          }`}
          style={{
            transform: isRefreshing ? "rotate(360deg)" : `rotate(${indicatorRotation}deg)`,
            transition: isRefreshing ? "transform 1s linear infinite" : "transform 0.2s",
          }}
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : "none",
          transition: canPull ? "none" : "transform 0.3s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}
