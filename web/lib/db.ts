import "server-only";
import postgres from "postgres";

// On Render (persistent server): set DATABASE_URL to the direct Supabase connection string.
// On Vercel (serverless): set DATABASE_URL to the pgbouncer pooler URL (port 6543).
const dbUrl =
  process.env.DATABASE_URL ??
  process.env.DATABASE_POSTGRES_PRISMA_URL ??
  process.env.DATABASE_POSTGRES_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL, DATABASE_POSTGRES_PRISMA_URL, or DATABASE_POSTGRES_URL must be set");
}

// pgbouncer transaction mode requires prepare:false and limits max connections.
// Direct connections can use prepared statements and a larger pool.
const isPgbouncer = dbUrl.includes("pgbouncer") || dbUrl.includes(":6543");

const pg = postgres(dbUrl, {
  ssl: dbUrl.includes("localhost") ? false : "require",
  max: isPgbouncer ? 1 : 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: !isPgbouncer,
});

export const sql = pg;

export interface Camera {
  id: string;
  brand: string;
  model: string;
  nickname: string | null;
  format: number;
  roll_count?: number;
}

export interface Film {
  id: string;
  brand: string;
  name: string;
  nickname: string | null;
  iso: number | null;
  color: boolean;
  show_iso: boolean;
  roll_count?: number;
}

export interface Roll {
  roll_number: string;
  camera_id: string | null;
  film_id: string | null;
  shot_at: string | null;
  fridge_at: string | null;
  lab_at: string | null;
  lab_name: string | null;
  scanned_at: string | null;
  processed_at: string | null;
  uploaded_at: string | null;
  archived_at: string | null;
  album_name: string | null;
  tags: string[] | null;
  notes: string | null;
  contact_sheet_url: string | null;
}

export type RollStatus = "LOADED" | "FRIDGE" | "LAB" | "SCANNED" | "PROCESSED" | "UPLOADED" | "ARCHIVED";

export function rollStatus(roll: Roll): RollStatus {
  if (roll.archived_at) return "ARCHIVED";
  if (roll.uploaded_at) return "UPLOADED";
  if (roll.processed_at) return "PROCESSED";
  if (roll.scanned_at) return "SCANNED";
  if (roll.lab_at) return "LAB";
  if (roll.fridge_at) return "FRIDGE";
  return "LOADED";
}
