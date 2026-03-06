/**
 * Loading Spinner Component
 *
 * Native-style circular loading indicator with smooth animation
 * Used for button loading states and inline loading indicators
 */

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-3",
};

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <div
      className={`${SIZE_CLASSES[size]} border-current border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

/**
 * Inline spinner with text
 */
export function SpinnerWithText({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 text-zinc-400 dark:text-zinc-500">
      <Spinner size="sm" />
      <span className="text-sm">{text}</span>
    </div>
  );
}
