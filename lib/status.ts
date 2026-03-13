export type RollStatus = "LOADED" | "FRIDGE" | "LAB" | "SCANNED" | "PROCESSED" | "UPLOADED" | "ARCHIVED";

export interface RollStatusData {
  archived_at: string | null;
  uploaded_at: string | null;
  processed_at: string | null;
  scanned_at: string | null;
  lab_at: string | null;
  fridge_at: string | null;
  loaded_at: string | null;
}

export function rollStatus(roll: RollStatusData): RollStatus {
  if (roll.archived_at) return "ARCHIVED";
  if (roll.uploaded_at) return "UPLOADED";
  if (roll.processed_at) return "PROCESSED";
  if (roll.scanned_at) return "SCANNED";
  if (roll.lab_at) return "LAB";
  if (roll.fridge_at) return "FRIDGE";
  return "LOADED";
}

export const STATUS_COLORS: Record<string, string> = {
  LOADED:    "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300",
  FRIDGE:    "bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-300",
  LAB:       "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300",
  SCANNED:   "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300",
  PROCESSED: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300",
  UPLOADED:  "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300",
  ARCHIVED:  "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300",
};

export const STATUS_BORDER: Record<string, string> = {
  LOADED:    "border-l-4 border-l-amber-400",
  FRIDGE:    "border-l-4 border-l-cyan-400",
  LAB:       "border-l-4 border-l-orange-400",
  SCANNED:   "border-l-4 border-l-green-400",
  PROCESSED: "border-l-4 border-l-purple-400",
  UPLOADED:  "border-l-4 border-l-blue-400",
  ARCHIVED:  "border-l-4 border-l-zinc-300 dark:border-l-zinc-600",
};

export const STATUS_ORDER = [
  "LOADED", "FRIDGE", "LAB", "SCANNED", "PROCESSED", "UPLOADED", "ARCHIVED",
] as const;
