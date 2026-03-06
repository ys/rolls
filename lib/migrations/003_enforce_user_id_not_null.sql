-- Migration: 003_enforce_user_id_not_null
-- Description: Make user_id NOT NULL on data tables after seeding existing data
-- Date: 2026-03-06
-- Note: Run this AFTER migration 002 AND after seeding existing data to first user

-- Make user_id NOT NULL on cameras
DO $$
BEGIN
  ALTER TABLE cameras ALTER COLUMN user_id SET NOT NULL;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'user_id on cameras already NOT NULL or data not seeded yet';
END $$;

-- Make user_id NOT NULL on films
DO $$
BEGIN
  ALTER TABLE films ALTER COLUMN user_id SET NOT NULL;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'user_id on films already NOT NULL or data not seeded yet';
END $$;

-- Make user_id NOT NULL on rolls
DO $$
BEGIN
  ALTER TABLE rolls ALTER COLUMN user_id SET NOT NULL;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'user_id on rolls already NOT NULL or data not seeded yet';
END $$;
