ALTER TABLE films ADD COLUMN IF NOT EXISTS slide BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE catalog_films ADD COLUMN IF NOT EXISTS slide BOOLEAN NOT NULL DEFAULT false;

-- Known slide films in the catalog
UPDATE catalog_films SET slide = true WHERE slug IN (
  'fujifilm-velvia-50',
  'fujifilm-velvia-100',
  'fujifilm-provia-100f',
  'fujifilm-astia-100f',
  'kodak-ektachrome-e100',
  'kodak-elite-chrome-200',
  'agfa-ct-precisa-100'
);
