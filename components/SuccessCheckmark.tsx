/**
 * Success Checkmark Animation
 *
 * Animated checkmark that draws itself for success feedback
 * Used after successful form submissions and actions
 */

interface SuccessCheckmarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export default function SuccessCheckmark({
  size = "md",
  className = "",
}: SuccessCheckmarkProps) {
  return (
    <svg
      className={`${SIZE_CLASSES[size]} ${className}`}
      viewBox="0 0 52 52"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="checkmark-circle"
        cx="26"
        cy="26"
        r="25"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        className="checkmark-check"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        d="M14 27l8 8 16-16"
      />
      <style jsx>{`
        .checkmark-circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }

        .checkmark-check {
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards;
        }

        @keyframes stroke {
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </svg>
  );
}

/**
 * Success message with animated checkmark
 */
export function SuccessMessage({ message = "Success!" }: { message?: string }) {
  return (
    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
      <SuccessCheckmark size="sm" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
