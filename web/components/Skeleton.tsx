/**
 * Skeleton Loading Components
 *
 * Provides shimmer-animated skeleton screens for improved perceived performance
 * Uses Tailwind's animate-pulse with custom gradients for native-like loading states
 */

interface SkeletonProps {
  className?: string;
}

/**
 * Base Skeleton component - single loading bar
 */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800 rounded ${className}`}
      style={{
        backgroundSize: "200% 100%",
        animation: "shimmer 2s infinite linear",
      }}
    />
  );
}

/**
 * Skeleton for a roll list item
 */
export function RollSkeleton() {
  return (
    <div className="space-y-3 py-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-2 h-2 rounded-full" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

/**
 * Skeleton for a camera/film list item
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <Skeleton className="h-8 w-8 rounded" />
    </div>
  );
}

/**
 * Skeleton for roll detail metadata fields
 */
export function MetadataSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for stats cards
 */
export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 space-y-3">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-10 w-16" />
    </div>
  );
}

/**
 * Skeleton for chart/graph placeholders
 */
export function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-32" />
      <div className="flex items-end gap-2 h-48">
        {[40, 60, 80, 70, 50, 90, 75].map((height, i) => (
          <Skeleton key={i} className={`flex-1`} style={{ height: `${height}%` }} />
        ))}
      </div>
    </div>
  );
}
