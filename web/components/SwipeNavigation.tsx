"use client";

import { useSwipeNav } from "@/hooks/useSwipeNav";

/**
 * SwipeNavigation Component
 *
 * Enables swipe left/right gestures to navigate between tabs
 * Must be used within a client component
 */
export default function SwipeNavigation() {
  useSwipeNav();
  return null;
}
