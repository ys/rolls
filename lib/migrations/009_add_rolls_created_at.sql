-- Migration 009: Add created_at to rolls table
-- Backfills from updated_at for existing rows

ALTER TABLE rolls ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
UPDATE rolls SET created_at = updated_at;
