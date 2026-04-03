class CreateSchemaIfNotExists < ActiveRecord::Migration[7.1]
  def up
    execute <<-SQL
      -- users
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        name TEXT,
        email TEXT UNIQUE,
        email_notifications BOOLEAN DEFAULT true,
        role TEXT DEFAULT 'user',
        invite_quota INT,
        invites_sent INT DEFAULT 0,
        created_at TIMESTAMPTZ,
        last_seen_at TIMESTAMPTZ,
        apple_user_id TEXT
      );

      -- webauthn_credentials
      CREATE TABLE IF NOT EXISTS webauthn_credentials (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        credential_id TEXT UNIQUE NOT NULL,
        public_key TEXT NOT NULL,
        counter BIGINT DEFAULT 0,
        transports TEXT[],
        device_name TEXT,
        last_used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ
      );

      -- api_keys
      CREATE TABLE IF NOT EXISTS api_keys (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        key_hash TEXT UNIQUE NOT NULL,
        label TEXT,
        last_used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ
      );

      -- invites
      CREATE TABLE IF NOT EXISTS invites (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        created_by TEXT REFERENCES users(id),
        used_by TEXT REFERENCES users(id),
        max_uses INT DEFAULT 1,
        used_count INT DEFAULT 0,
        expires_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ,
        used_at TIMESTAMPTZ
      );

      -- cameras
      CREATE TABLE IF NOT EXISTS cameras (
        uuid TEXT PRIMARY KEY,
        slug TEXT NOT NULL,
        user_id TEXT REFERENCES users(id),
        brand TEXT,
        model TEXT,
        nickname TEXT,
        format INT DEFAULT 135,
        updated_at TIMESTAMPTZ,
        UNIQUE (user_id, slug)
      );

      -- films
      CREATE TABLE IF NOT EXISTS films (
        uuid TEXT PRIMARY KEY,
        slug TEXT NOT NULL,
        user_id TEXT REFERENCES users(id),
        brand TEXT,
        name TEXT,
        nickname TEXT,
        iso INT,
        color BOOLEAN DEFAULT true,
        slide BOOLEAN DEFAULT false,
        show_iso BOOLEAN DEFAULT false,
        gradient_from TEXT,
        gradient_to TEXT,
        updated_at TIMESTAMPTZ,
        UNIQUE (user_id, slug)
      );

      -- rolls
      CREATE TABLE IF NOT EXISTS rolls (
        uuid TEXT PRIMARY KEY,
        roll_number TEXT,
        user_id TEXT REFERENCES users(id),
        camera_uuid TEXT REFERENCES cameras(uuid),
        film_uuid TEXT REFERENCES films(uuid),
        loaded_at TIMESTAMPTZ,
        shot_at DATE,
        fridge_at TIMESTAMPTZ,
        lab_at TIMESTAMPTZ,
        lab_name TEXT,
        lab_id TEXT,
        scanned_at DATE,
        processed_at TIMESTAMPTZ,
        uploaded_at TIMESTAMPTZ,
        archived_at TIMESTAMPTZ,
        album_name TEXT,
        tags TEXT[],
        notes TEXT,
        contact_sheet_url TEXT,
        push_pull INT,
        created_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ,
        UNIQUE (user_id, roll_number)
      );

      -- catalog_films
      CREATE TABLE IF NOT EXISTS catalog_films (
        slug TEXT PRIMARY KEY,
        brand TEXT,
        name TEXT,
        nickname TEXT,
        iso INT,
        color BOOLEAN DEFAULT true,
        slide BOOLEAN DEFAULT false,
        show_iso BOOLEAN DEFAULT false,
        gradient_from TEXT,
        gradient_to TEXT
      );
    SQL
  end

  def down
    # Do not drop tables in production — this migration works with existing data
    raise ActiveRecord::IrreversibleMigration
  end
end
