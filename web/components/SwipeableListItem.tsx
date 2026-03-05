"use client";

import { ReactNode, useRef, useState } from "react";
import { haptics } from "../lib/haptics";

interface SwipeableListItemProps {
  children: ReactNode;
  onDelete: () => void | Promise<void>;
  deleteLabel?: string;
  className?: string;
}

const SWIPE_THRESHOLD = 100; // Pixels to swipe before showing delete

/**
 * Swipeable List Item Component
 *
 * Enables iOS-style swipe-to-delete on list items
 * Features:
 * - Swipe left to reveal delete button
 * - Haptic feedback
 * - Smooth animations
 * - Snap-back or complete deletion
 *
 * Usage:
 * ```
 * <SwipeableListItem onDelete={() => handleDelete(id)}>
 *   <div>Your list item content</div>
 * </SwipeableListItem>
 * ```
 */
export default function SwipeableListItem({
  children,
  onDelete,
  deleteLabel = "Delete",
  className = "",
}: SwipeableListItemProps) {
  const [swipeX, setSwipeX] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const startX = useRef(0);
  const currentX = useRef(0);
  const isSwiping = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isSwiping.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping.current || isDeleting) return;

    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;

    // Only allow left swipe (negative deltaX)
    if (deltaX < 0) {
      const resistedDelta = deltaX * 0.5; // Add resistance
      setSwipeX(Math.max(resistedDelta, -SWIPE_THRESHOLD));

      // Haptic feedback when threshold reached
      if (swipeX <= -SWIPE_THRESHOLD && deltaX > -SWIPE_THRESHOLD - 10) {
        haptics.light();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!isSwiping.current) return;

    // If swiped past threshold, trigger delete
    if (swipeX <= -SWIPE_THRESHOLD) {
      setIsDeleting(true);
      haptics.warning();

      try {
        await onDelete();
      } catch (error) {
        // Reset on error
        setSwipeX(0);
        setIsDeleting(false);
        haptics.error();
      }
    } else {
      // Snap back if not swiped enough
      setSwipeX(0);
    }

    isSwiping.current = false;
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Delete action background */}
      <div className="absolute inset-y-0 right-0 flex items-center justify-end bg-red-500 dark:bg-red-600 px-6">
        <span className="text-white font-medium text-sm">{deleteLabel}</span>
      </div>

      {/* Swipeable content */}
      <div
        className="bg-white dark:bg-zinc-950 transition-transform"
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: isSwiping.current ? "none" : "transform 0.3s ease-out",
          opacity: isDeleting ? 0 : 1,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
