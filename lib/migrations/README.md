# Database Migrations

This directory contains SQL migration files that are tracked and applied automatically.

## How It Works

- **Automatic on Heroku**: Migrations run automatically during the release phase (before new code is deployed)
- **Manual locally**: Run `npm run migrate` to apply pending migrations
- **Idempotent**: Safe to re-run migrations - they track what's been applied
- **Ordered**: Migrations run in alphabetical order (use numbered prefixes: `001_`, `002_`, etc.)

## Migration Format

Each migration file should:
1. Start with a numbered prefix: `001_description.sql`, `002_another.sql`
2. Be idempotent (safe to run multiple times)
3. Include a comment header describing the change

Example:

```sql
-- Migration: 001_add_updated_at
-- Description: Add updated_at columns for cache invalidation
-- Date: 2026-03-05

-- Your SQL here (use IF NOT EXISTS, CREATE OR REPLACE, etc.)
```

## Commands

```bash
# Run pending migrations (local development)
npm run migrate

# On Heroku: migrations run automatically on git push
git push heroku main
```

## Migration Tracking

Migrations are tracked in the `schema_migrations` table:
- Each applied migration is recorded with its filename
- The runner skips already-applied migrations
- Safe to re-run the migration command

## Creating a New Migration

1. Create a new file in this directory:
   ```bash
   touch web/lib/migrations/002_my_change.sql
   ```

2. Write idempotent SQL:
   ```sql
   -- Migration: 002_my_change
   -- Description: What this migration does

   ALTER TABLE my_table ADD COLUMN IF NOT EXISTS ...;
   ```

3. Test locally:
   ```bash
   npm run migrate
   ```

4. Commit and push - it will run on Heroku automatically

## Rollbacks

This system doesn't support automatic rollbacks. If you need to undo a migration:
1. Create a new migration that reverses the changes
2. Apply it like any other migration

## Tips for Idempotent SQL

- Use `IF NOT EXISTS` for CREATE statements
- Use `IF EXISTS` for DROP statements
- Use `CREATE OR REPLACE` for functions/views
- Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...` for columns
- Wrap conditional logic in `DO $$ ... END $$` blocks

## Example: Conditional Column Addition

```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'my_table' AND column_name = 'my_column'
  ) THEN
    ALTER TABLE my_table ADD COLUMN my_column TEXT;
  END IF;
END $$;
```

## Verification

After running a migration, verify it worked:

```sql
-- Check what migrations have been applied
SELECT * FROM schema_migrations ORDER BY applied_at;

-- For the updated_at migration specifically:
\d cameras
\d films
\d rolls

-- Check triggers exist
\dS update_cameras_updated_at
\dS update_films_updated_at
\dS update_rolls_updated_at

-- Test it works
UPDATE cameras SET brand = brand WHERE id = (SELECT id FROM cameras LIMIT 1);
SELECT id, updated_at FROM cameras ORDER BY updated_at DESC LIMIT 1;
```

The `updated_at` should have just been updated to NOW().
