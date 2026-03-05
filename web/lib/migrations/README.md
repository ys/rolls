# Database Migrations

## Applying the updated_at migration

This migration adds `updated_at` columns and triggers to track when data changes.
This enables smart cache invalidation based on server-side timestamps.

### Apply the migration

```bash
# Connect to your database and run:
psql $DATABASE_URL -f web/lib/migrations/add_updated_at.sql
```

Or using your SQL client, execute the contents of `add_updated_at.sql`.

### What it does

1. Adds `updated_at TIMESTAMP WITH TIME ZONE` to cameras, films, and rolls tables
2. Creates a trigger function that auto-updates the timestamp
3. Attaches triggers to each table to update on modifications

### Verification

After running the migration, verify it worked:

```sql
-- Check columns exist
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
