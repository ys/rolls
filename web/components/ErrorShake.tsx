"use client";

import { ReactNode, useEffect, useState } from "react";
import { haptics } from "../lib/haptics";

interface ErrorShakeProps {
  children: ReactNode;
  trigger: boolean; // When true, triggers the shake animation
  className?: string;
}

/**
 * Error Shake Animation
 *
 * Wraps content and shakes it when an error occurs
 * Provides haptic feedback on error
 * Common pattern in native apps for validation errors
 */
export default function ErrorShake({ children, trigger, className = "" }: ErrorShakeProps) {
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsShaking(true);
      haptics.error();

      // Reset after animation completes
      const timeout = setTimeout(() => {
        setIsShaking(false);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [trigger]);

  return (
    <div className={`${isShaking ? "animate-shake" : ""} ${className}`}>
      {children}
      <style jsx>{`
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-10px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(10px);
          }
        }

        :global(.animate-shake) {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }
      `}</style>
    </div>
  );
}

/**
 * Error message component with icon
 */
export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
