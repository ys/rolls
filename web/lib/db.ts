import "server-only";
import postgres from "postgres";

// Prefer the pooler URL (pgbouncer transaction mode, port 6543).
// DATABASE_POSTGRES_PRISMA_URL already has ?pgbouncer=true&connection_limit=1 appended by Supabase.
const dbUrl =
  process.env.DATABASE_URL ??
  process.env.DATABASE_POSTGRES_PRISMA_URL ??
  process.env.DATABASE_POSTGRES_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL, DATABASE_POSTGRES_PRISMA_URL, or DATABASE_POSTGRES_URL must be set");
}

const pg = postgres(dbUrl, {
  ssl: dbUrl.includes("localhost") ? false : "require",
  max: 1,            // single connection per serverless function instance
  idle_timeout: 20,  // keep alive for 20s to benefit from warm invocations
  connect_timeout: 10,
  prepare: false,    // pgbouncer transaction mode doesn't support prepared statements
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
