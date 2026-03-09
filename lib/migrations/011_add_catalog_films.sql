-- Migration: 011_add_catalog_films
-- Description: Create catalog_films table and seed with known film stocks
-- Date: 2026-03-09

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

INSERT INTO catalog_films (slug, brand, name, nickname, iso, color, show_iso, gradient_from, gradient_to) VALUES
  ('adox-color-mission-200', 'Adox',           'Color Mission',  'Adox Color Mission 200',        200, true,  false, '#f97316', '#2d7d6e'),
  ('berlin-400',             'Lomography',     'Berlin',         'Lomography Berlin 400',          400, false, true,  '#1e3a5f', '#0f172a'),
  ('cinestill-400d',         'Cinestill',      '400D',           'CineStill 400D',                 400, true,  false, '#7c3aed', '#09090b'),
  ('color-plus',             'Kodak',          'Color Plus',     'Kodak Color Plus 200',           200, true,  false, '#fde047', '#facc15'),
  ('earl-grey',              'Lomography',     'Earl Grey',      'Lomography Earl Grey 100',       100, false, true,  '#a1a1aa', '#71717a'),
  ('ektar-100',              'Kodak',          'Ektar',          'Kodak Ektar 100',                100, true,  false, '#dc2626', '#991b1b'),
  ('foma-400',               'Fomapan',        'Action',         'Fomapan Action 400',             400, false, true,  '#71717a', '#52525b'),
  ('fuji-c200',              'Fuji',           'C200',           'Fuji C200',                      200, true,  false, '#4ade80', '#16a34a'),
  ('fuji-superia-200',       'Fuji',           'Superia',        'Fuji Superia 200',               200, true,  true,  '#4ade80', '#16a34a'),
  ('fuji-superia-400',       'Fuji',           'Superia',        'Fuji Superia 400',               400, true,  true,  '#22c55e', '#15803d'),
  ('gold-200',               'Kodak',          'Gold',           'Kodak Gold 200',                 200, true,  false, '#fbbf24', '#f59e0b'),
  ('ilford-hp5',             'Ilford',         'HP5',            'Ilford HP5+',                    400, false, false, '#4ade80', '#e4e4e7'),
  ('kentmere-100',           'Kentmere',       'Pan',            'Kentmere Pan 100',               100, false, true,  '#60a5fa', '#93c5fd'),
  ('kentmere-400',           'Kentmere',       'Pan',            'Kentmere Pan 400',               400, false, true,  '#7c3aed', '#ec4899'),
  ('kiro-400',               'Film Never Die', 'Kiro',           'Film Never Die Kiro 400',        400, true,  true,  '#f472b6', '#ec4899'),
  ('lomo-400',               'Lomography',     'Color Negative', 'Lomography Color Negative 400',  400, true,  true,  '#22d3ee', '#06b6d4'),
  ('lomo-800',               'Lomography',     'Color Negative', 'Lomography Color Negative 800',  800, true,  true,  '#c084fc', '#a855f7'),
  ('portra-160',             'Kodak',          'Portra',         'Kodak Portra 160',               160, true,  true,  '#fed7aa', '#fdba74'),
  ('portra-400',             'Kodak',          'Portra',         'Kodak Portra 400',               400, true,  true,  '#f5c518', '#6d28d9'),
  ('portra-800',             'Kodak',          'Portra',         'Kodak Portra 800',               800, true,  true,  '#fb923c', '#f97316'),
  ('psych-blue',             'Psych',          'Blue',           'Psych Blue',                     0,   true,  false, '#818cf8', '#6366f1'),
  ('redscale-50',            'Lomography',     'Redscale',       'Lomography Redscale 50',         50,  true,  true,  '#f97316', '#dc2626'),
  ('rollei-400s',            'Rollei',         'Retro 400S',     'Rollei Retro 400S',              400, false, false, '#78716c', '#57534e'),
  ('rollei-superpan-200',    'Rollei',         'Superpan 200',   'Rollei Superpan 200',            200, false, false, '#64748b', '#475569'),
  ('sensia-50',              'Fuji',           'Sensia',         'Fuji Sensia 50',                 50,  true,  true,  '#16a34a', '#3b82f6'),
  ('sora-200',               'Film Never Die', 'Sora',           'Film Never Die Sora 200',        200, true,  true,  '#38bdf8', '#0ea5e9'),
  ('trix-400',               'Kodak',          'Tri-X',          'Kodak Tri-X 400',                400, false, false, '#3f3f46', '#18181b'),
  ('ultramax',               'Kodak',          'Ultramax',       'Kodak Ultramax 400',             400, true,  false, '#ffd700', '#2563eb'),
  ('vision3-250d',           'Kodak',          'Vision3 250D',   'Kodak Vision3 250D',             250, true,  false, '#fbbf24', '#1c1917'),
  ('xpro-200',               'Lomography',     'X-Pro',          'Lomography X-Pro 200',           200, true,  true,  '#fb923c', '#f97316')
ON CONFLICT (slug) DO UPDATE SET
  brand         = EXCLUDED.brand,
  name          = EXCLUDED.name,
  nickname      = EXCLUDED.nickname,
  iso           = EXCLUDED.iso,
  color         = EXCLUDED.color,
  show_iso      = EXCLUDED.show_iso,
  gradient_from = EXCLUDED.gradient_from,
  gradient_to   = EXCLUDED.gradient_to;
