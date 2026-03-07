-- Migration: 003_uuid_refactor
-- Description: Migrate from TEXT PKs to UUID PKs with separate slug columns
-- Date: 2026-03-06
--
-- Changes:
-- - Add UUID primary keys with gen_random_uuid() defaults
-- - Rename id/roll_number columns to slug
-- - Add unique constraints on (user_id, slug)
-- - Update foreign keys to use UUIDs
-- - Add indexes for slug lookups

-- ============================================================================
-- Step 1: Cameras Table
-- ============================================================================

-- Drop existing foreign key constraints from rolls first (will recreate later)
ALTER TABLE rolls DROP CONSTRAINT IF EXISTS rolls_camera_id_fkey;
ALTER TABLE rolls DROP CONSTRAINT IF EXISTS rolls_film_id_fkey;

-- Drop old unique constraint on cameras
ALTER TABLE cameras DROP CONSTRAINT IF EXISTS cameras_user_id_id_uniq;

-- Add UUID column with default
ALTER TABLE cameras ADD COLUMN uuid UUID DEFAULT gen_random_uuid();

-- Set UUID as primary key
ALTER TABLE cameras DROP CONSTRAINT IF EXISTS cameras_pkey;
ALTER TABLE cameras ADD PRIMARY KEY (uuid);

-- Rename old id column to slug
ALTER TABLE cameras RENAME COLUMN id TO slug;

-- Add unique constraint on (user_id, slug)
ALTER TABLE cameras ADD CONSTRAINT cameras_user_id_slug_uniq UNIQUE (user_id, slug);

-- Create index for slug lookups (speeds up WHERE slug = queries)
CREATE INDEX IF NOT EXISTS cameras_slug_idx ON cameras (slug);

-- Drop unused internal_id from migration 001
ALTER TABLE cameras DROP COLUMN IF EXISTS internal_id;

-- ============================================================================
-- Step 2: Films Table
-- ============================================================================

-- Drop old unique constraint on films
ALTER TABLE films DROP CONSTRAINT IF EXISTS films_user_id_id_uniq;

-- Add UUID column with default
ALTER TABLE films ADD COLUMN uuid UUID DEFAULT gen_random_uuid();

-- Set UUID as primary key
ALTER TABLE films DROP CONSTRAINT IF EXISTS films_pkey;
ALTER TABLE films ADD PRIMARY KEY (uuid);

-- Rename old id column to slug
ALTER TABLE films RENAME COLUMN id TO slug;

-- Add unique constraint on (user_id, slug)
ALTER TABLE films ADD CONSTRAINT films_user_id_slug_uniq UNIQUE (user_id, slug);

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS films_slug_idx ON films (slug);

-- Drop unused internal_id from migration 001
ALTER TABLE films DROP COLUMN IF EXISTS internal_id;

-- ============================================================================
-- Step 3: Rolls Table - Foreign Key Migration
-- ============================================================================

-- Drop old unique constraint on rolls
ALTER TABLE rolls DROP CONSTRAINT IF EXISTS rolls_user_id_roll_number_uniq;

-- Rename foreign key columns temporarily (for migration safety)
ALTER TABLE rolls RENAME COLUMN camera_id TO camera_slug;
ALTER TABLE rolls RENAME COLUMN film_id TO film_slug;

-- Add new UUID foreign key columns
ALTER TABLE rolls ADD COLUMN camera_uuid UUID;
ALTER TABLE rolls ADD COLUMN film_uuid UUID;

-- Populate UUID foreign keys by joining on slugs and user_id
UPDATE rolls r
SET camera_uuid = c.uuid
FROM cameras c
WHERE r.camera_slug = c.slug AND r.user_id = c.user_id;

UPDATE rolls r
SET film_uuid = f.uuid
FROM films f
WHERE r.film_slug = f.slug AND r.user_id = f.user_id;

-- Add foreign key constraints
ALTER TABLE rolls ADD CONSTRAINT rolls_camera_uuid_fkey
  FOREIGN KEY (camera_uuid) REFERENCES cameras(uuid);

ALTER TABLE rolls ADD CONSTRAINT rolls_film_uuid_fkey
  FOREIGN KEY (film_uuid) REFERENCES films(uuid);

-- ============================================================================
-- Step 4: Rolls Table - Primary Key Migration
-- ============================================================================

-- Rename roll_number to slug
ALTER TABLE rolls RENAME COLUMN roll_number TO slug;

-- Add UUID column with default
ALTER TABLE rolls ADD COLUMN uuid UUID DEFAULT gen_random_uuid();

-- Set UUID as primary key
ALTER TABLE rolls DROP CONSTRAINT IF EXISTS rolls_pkey;
ALTER TABLE rolls ADD PRIMARY KEY (uuid);

-- Add unique constraint on (user_id, slug)
ALTER TABLE rolls ADD CONSTRAINT rolls_user_id_slug_uniq UNIQUE (user_id, slug);

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS rolls_slug_idx ON rolls (slug);

-- Drop unused internal_id from migration 001
ALTER TABLE rolls DROP COLUMN IF EXISTS internal_id;

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Note: Temporary camera_slug and film_slug columns are kept for now.
-- They will be dropped in migration 004 after verification.
