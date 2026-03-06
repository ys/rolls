-- Migration: 004_cleanup_slug_columns
-- Description: Remove temporary slug columns from rolls table after UUID refactor
-- Date: 2026-03-06
--
-- This migration removes the temporary camera_slug and film_slug columns
-- that were kept during the UUID refactor (migration 003) to facilitate
-- data migration. These columns are no longer needed as we now use
-- camera_uuid and film_uuid for foreign key relationships.

-- Drop temporary slug reference columns
ALTER TABLE rolls DROP COLUMN IF EXISTS camera_slug;
ALTER TABLE rolls DROP COLUMN IF EXISTS film_slug;
