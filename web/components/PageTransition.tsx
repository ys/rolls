"use client";

import { useEffect, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Page Transition Component
 *
 * Provides smooth fade + slide animations between page navigations
 * Respects prefers-reduced-motion accessibility preference
 */
export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // Skip animations if user prefers reduced motion
      setDisplayChildren(children);
      return;
    }

    // Start exit animation
    setIsTransitioning(true);

    // Wait for exit animation, then update content
    const exitTimeout = setTimeout(() => {
      setDisplayChildren(children);
      setIsTransitioning(false);
    }, 150); // Half of total transition time

    return () => clearTimeout(exitTimeout);
  }, [pathname, children]);

  return (
    <div
      className="transition-all duration-300 ease-in-out"
      style={{
        opacity: isTransitioning ? 0 : 1,
        transform: isTransitioning ? "translateY(10px)" : "translateY(0)",
      }}
    >
      {displayChildren}
    </div>
  );
}
