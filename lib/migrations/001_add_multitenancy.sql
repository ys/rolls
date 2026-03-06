-- Migration: 002_add_multitenancy
-- Description: Add users, WebAuthn credentials, API keys, and invites tables. Add user_id to data tables.
-- Date: 2026-03-06
-- Note: This migration is safe to run before code deploy (nullable columns, no NOT NULL constraints yet)

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username TEXT NOT NULL UNIQUE,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create webauthn_credentials table
CREATE TABLE IF NOT EXISTS webauthn_credentials (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  transports TEXT[],
  device_name TEXT,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS webauthn_credentials_user_id_idx ON webauthn_credentials (user_id);
CREATE INDEX IF NOT EXISTS webauthn_credentials_credential_id_idx ON webauthn_credentials (credential_id);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  label TEXT,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS api_keys_key_hash_idx ON api_keys (key_hash);

-- Create invites table
CREATE TABLE IF NOT EXISTS invites (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT NOT NULL UNIQUE,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  used_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS invites_code_idx ON invites (code);
CREATE INDEX IF NOT EXISTS invites_created_by_idx ON invites (created_by);

-- Add user_id columns to existing tables (nullable for now, will be made NOT NULL in migration 002)
-- Note: Keep existing PKs intact - migration 003 will handle UUID refactor

-- cameras: add user_id and add unique constraint on (user_id, id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cameras' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE cameras ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cameras_user_id_id_uniq'
  ) THEN
    ALTER TABLE cameras ADD CONSTRAINT cameras_user_id_id_uniq UNIQUE (user_id, id);
  END IF;
END $$;

-- Add internal_id for future use (will be removed in migration 003)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cameras' AND column_name = 'internal_id'
  ) THEN
    ALTER TABLE cameras ADD COLUMN internal_id BIGSERIAL;
  END IF;
END $$;

-- films: same pattern
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'films' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE films ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'films_user_id_id_uniq'
  ) THEN
    ALTER TABLE films ADD CONSTRAINT films_user_id_id_uniq UNIQUE (user_id, id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'films' AND column_name = 'internal_id'
  ) THEN
    ALTER TABLE films ADD COLUMN internal_id BIGSERIAL;
  END IF;
END $$;

-- rolls: same pattern
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rolls' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE rolls ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'rolls_user_id_roll_number_uniq'
  ) THEN
    ALTER TABLE rolls ADD CONSTRAINT rolls_user_id_roll_number_uniq UNIQUE (user_id, roll_number);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rolls' AND column_name = 'internal_id'
  ) THEN
    ALTER TABLE rolls ADD COLUMN internal_id BIGSERIAL;
  END IF;
END $$;

-- Note: Foreign keys on rolls.camera_id and rolls.film_id remain unchanged
-- They still reference cameras(id) and films(id) which are still PRIMARY KEYs
