CREATE TABLE IF NOT EXISTS cameras (
  id         TEXT PRIMARY KEY,
  brand      TEXT NOT NULL,
  model      TEXT NOT NULL,
  nickname   TEXT,
  format     INT  DEFAULT 135,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS films (
  id         TEXT PRIMARY KEY,
  brand      TEXT NOT NULL,
  name       TEXT NOT NULL,
  nickname   TEXT,
  iso        INT,
  color      BOOLEAN DEFAULT true,
  show_iso   BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rolls (
  roll_number       TEXT PRIMARY KEY,
  camera_id         TEXT REFERENCES cameras(id),
  film_id           TEXT REFERENCES films(id),
  shot_at           DATE,
  fridge_at         TIMESTAMP WITH TIME ZONE,
  lab_at            TIMESTAMP WITH TIME ZONE,
  lab_name          TEXT,
  scanned_at        DATE,
  processed_at      TIMESTAMP WITH TIME ZONE,
  archived_at       TIMESTAMP WITH TIME ZONE,
  album_name        TEXT,
  tags              TEXT[],
  notes             TEXT,
  contact_sheet_url TEXT,
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS catalog_films (
  slug          TEXT PRIMARY KEY,
  brand         TEXT NOT NULL,
  name          TEXT NOT NULL,
  nickname      TEXT,
  iso           INT,
  color         BOOLEAN DEFAULT true,
  show_iso      BOOLEAN DEFAULT false,
  gradient_from TEXT,
  gradient_to   TEXT
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at on modifications
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
