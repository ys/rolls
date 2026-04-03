class AddMissingSchemaColumns < ActiveRecord::Migration[7.1]
  def up
    execute <<~SQL
      -- films + catalog_films: slide column added in later Next.js migration
      ALTER TABLE films ADD COLUMN IF NOT EXISTS slide BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE catalog_films ADD COLUMN IF NOT EXISTS slide BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE films ADD COLUMN IF NOT EXISTS gradient_from TEXT;
      ALTER TABLE films ADD COLUMN IF NOT EXISTS gradient_to TEXT;

      -- cameras: missing updated_at trigger columns (already added by schema but may be absent in old test DBs)
      ALTER TABLE cameras ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

      -- users: missing columns
      ALTER TABLE users ADD COLUMN IF NOT EXISTS apple_user_id TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_quota INT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS invites_sent INT DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

      -- rolls: ensure all columns present
      ALTER TABLE rolls ADD COLUMN IF NOT EXISTS loaded_at TIMESTAMPTZ;
      ALTER TABLE rolls ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ;
      ALTER TABLE rolls ADD COLUMN IF NOT EXISTS push_pull INT;
      ALTER TABLE rolls ADD COLUMN IF NOT EXISTS lab_id TEXT;
      ALTER TABLE rolls ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;
    SQL
  end

  def down; end
end
