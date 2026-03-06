import "server-only";
import postgres from "postgres";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL must be set");
}

const pg = postgres(dbUrl, {
  ssl: dbUrl.includes("localhost") ? false : { rejectUnauthorized: false },
  max: 10,
  idle_timeout: 20,
  connect_timeout: 60, // Extended timeout for reliable Heroku-to-RDS connections
});

export const sql = pg;

export interface User {
  id: string;
  username: string;
  name: string | null;
  email: string;
  email_notifications: boolean;
  created_at: string;
}

export interface WebAuthnCredential {
  id: string;
  user_id: string;
  credential_id: string;
  public_key: string;
  counter: number;
  transports: string[] | null;
  device_name: string | null;
  last_used_at: string | null;
  created_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  key_hash: string;
  label: string | null;
  last_used_at: string | null;
  created_at: string;
}

export interface Invite {
  id: string;
  code: string;
  created_by: string;
  used_by: string | null;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  created_at: string;
  used_at: string | null;
}

export interface Camera {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  nickname: string | null;
  format: number;
  roll_count?: number;
}

export interface Film {
  id: string;
  user_id: string;
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
  user_id: string;
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
