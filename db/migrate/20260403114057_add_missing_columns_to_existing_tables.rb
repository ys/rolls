class AddMissingColumnsToExistingTables < ActiveRecord::Migration[7.1]
  def up
    execute <<~SQL
      ALTER TABLE users ADD COLUMN IF NOT EXISTS apple_user_id TEXT;
      ALTER TABLE rolls ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ;
    SQL
  end

  def down
  end
end
