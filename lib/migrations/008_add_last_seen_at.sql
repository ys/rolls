-- Migration 008: Add last_seen_at to users table
-- Tracks when a user last made an authenticated request (updated async in middleware)

ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;
