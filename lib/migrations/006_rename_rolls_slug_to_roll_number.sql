-- Migration: 006_rename_rolls_slug_to_roll_number
-- Description: Rename rolls.slug back to roll_number
-- The UUID refactor (003) renamed roll_number to slug, but roll_number
-- is the canonical identifier for rolls and should keep its name.

ALTER TABLE rolls RENAME COLUMN slug TO roll_number;
