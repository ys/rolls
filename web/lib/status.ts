export const STATUS_COLORS: Record<string, string> = {
  LOADED:    "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300",
  FRIDGE:    "bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-300",
  LAB:       "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300",
  SCANNED:   "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300",
  PROCESSED: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300",
  UPLOADED:  "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300",
  ARCHIVED:  "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300",
};

export const STATUS_ORDER = [
  "LOADED", "FRIDGE", "LAB", "SCANNED", "PROCESSED", "UPLOADED", "ARCHIVED",
] as const;
