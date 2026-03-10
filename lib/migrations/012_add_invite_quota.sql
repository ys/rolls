-- Migration: 012_add_invite_quota
-- Description: Add invite quota system for normal users
-- Date: 2026-03-10

-- Add invite quota fields to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'invite_quota'
  ) THEN
    ALTER TABLE users ADD COLUMN invite_quota INTEGER DEFAULT 3;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'invites_sent'
  ) THEN
    ALTER TABLE users ADD COLUMN invites_sent INTEGER DEFAULT 0;
  END IF;
END $$;

-- Set existing users to have 3 invites (admins get unlimited = NULL)
UPDATE users
SET invite_quota = 3, invites_sent = 0
WHERE invite_quota IS NULL AND role = 'user';

-- Admins get unlimited invites (NULL quota)
UPDATE users
SET invite_quota = NULL, invites_sent = 0
WHERE role = 'admin';
