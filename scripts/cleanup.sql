-- Strip Obsidian meta-bind-button / button code blocks from notes
UPDATE rolls
SET notes = btrim(regexp_replace(notes, '(?s)\s*```.*?```', '', 'g'))
WHERE notes ~ '```';

-- Null out malformed tag arrays (e.g. {[[]]}, {[[[]]]}) from old CLI push
UPDATE rolls SET tags = NULL WHERE tags IS NOT NULL;
