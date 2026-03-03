export const STATUS_COLORS: Record<string, string> = {
  LOADED:    "bg-amber-900 text-amber-300",
  FRIDGE:    "bg-cyan-900 text-cyan-300",
  LAB:       "bg-orange-900 text-orange-300",
  SCANNED:   "bg-green-900 text-green-300",
  PROCESSED: "bg-purple-900 text-purple-300",
  UPLOADED:  "bg-blue-900 text-blue-300",
  ARCHIVED:  "bg-zinc-700 text-zinc-300",
};

export const STATUS_ORDER = [
  "LOADED", "FRIDGE", "LAB", "SCANNED", "PROCESSED", "UPLOADED", "ARCHIVED",
] as const;
