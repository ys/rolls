CREATE TABLE IF NOT EXISTS cameras (
  id       TEXT PRIMARY KEY,
  brand    TEXT NOT NULL,
  model    TEXT NOT NULL,
  nickname TEXT,
  format   INT  DEFAULT 135
);

CREATE TABLE IF NOT EXISTS films (
  id       TEXT PRIMARY KEY,
  brand    TEXT NOT NULL,
  name     TEXT NOT NULL,
  nickname TEXT,
  iso      INT,
  color    BOOLEAN DEFAULT true,
  show_iso BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS rolls (
  roll_number  TEXT PRIMARY KEY,
  camera_id    TEXT REFERENCES cameras(id),
  film_id      TEXT REFERENCES films(id),
  shot_at      DATE,
  fridge_at    TIMESTAMP WITH TIME ZONE,
  lab_at       TIMESTAMP WITH TIME ZONE,
  lab_name     TEXT,
  scanned_at   DATE,
  processed_at TIMESTAMP WITH TIME ZONE,
  uploaded_at  TIMESTAMP WITH TIME ZONE,
  archived_at  TIMESTAMP WITH TIME ZONE,
  album_name   TEXT,
  tags         TEXT[],
  notes        TEXT
);
