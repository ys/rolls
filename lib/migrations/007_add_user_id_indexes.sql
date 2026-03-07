-- Migration: 007_add_user_id_indexes
-- Description: Add user_id indexes on cameras, films, rolls for query performance.
-- Also rename the stale rolls_slug_idx (column was renamed to roll_number in 006).

CREATE INDEX IF NOT EXISTS cameras_user_id_idx ON cameras (user_id);
CREATE INDEX IF NOT EXISTS films_user_id_idx ON films (user_id);
CREATE INDEX IF NOT EXISTS rolls_user_id_idx ON rolls (user_id);

-- rolls_slug_idx is now stale (column renamed to roll_number in migration 006)
DROP INDEX IF EXISTS rolls_slug_idx;
CREATE INDEX IF NOT EXISTS rolls_roll_number_idx ON rolls (roll_number);
