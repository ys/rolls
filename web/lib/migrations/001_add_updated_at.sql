-- Migration: 001_add_updated_at
-- Description: Add updated_at columns and triggers for cache invalidation
-- Date: 2026-03-05

-- Add updated_at columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cameras' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE cameras ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'films' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE films ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rolls' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE rolls ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Create function to update updated_at timestamp (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update updated_at on modifications (idempotent with DROP IF EXISTS)
DROP TRIGGER IF EXISTS update_cameras_updated_at ON cameras;
CREATE TRIGGER update_cameras_updated_at
  BEFORE UPDATE ON cameras
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_films_updated_at ON films;
CREATE TRIGGER update_films_updated_at
  BEFORE UPDATE ON films
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rolls_updated_at ON rolls;
CREATE TRIGGER update_rolls_updated_at
  BEFORE UPDATE ON rolls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
