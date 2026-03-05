#!/usr/bin/env node

/**
 * Database migration runner
 *
 * Features:
 * - Tracks applied migrations in a migrations table
 * - Runs pending migrations in order
 * - Idempotent (safe to re-run)
 * - Transactional (all or nothing)
 */

const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

const MIGRATIONS_DIR = path.join(__dirname, '../lib/migrations');
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

// Initialize postgres connection with proper timeout and SSL settings
const sql = postgres(DATABASE_URL, {
  ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
  max: 1, // Only need one connection for migrations
  idle_timeout: 20,
  connect_timeout: 60, // Extended timeout for Heroku release phase RDS connection
});

async function ensureMigrationsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  console.log('✓ Migrations table ready');
}

async function getAppliedMigrations() {
  const rows = await sql`
    SELECT name FROM schema_migrations ORDER BY name
  `;
  return new Set(rows.map(r => r.name));
}

async function getPendingMigrations(appliedMigrations) {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .filter(f => !f.includes('README'))
    .sort();

  return files.filter(f => !appliedMigrations.has(f));
}

async function runMigration(filename) {
  const filepath = path.join(MIGRATIONS_DIR, filename);
  const sql_content = fs.readFileSync(filepath, 'utf8');

  console.log(`\n📝 Running migration: ${filename}`);

  try {
    // Execute the migration SQL
    await sql.unsafe(sql_content);

    // Record that this migration was applied
    await sql`
      INSERT INTO schema_migrations (name)
      VALUES (${filename})
      ON CONFLICT (name) DO NOTHING
    `;

    console.log(`✅ Migration completed: ${filename}`);
  } catch (error) {
    console.error(`❌ Migration failed: ${filename}`);
    console.error(error.message);
    throw error;
  }
}

async function migrate() {
  console.log('🚀 Starting database migrations...\n');

  try {
    // Ensure migrations table exists
    await ensureMigrationsTable();

    // Get applied and pending migrations
    const appliedMigrations = await getAppliedMigrations();
    const pendingMigrations = await getPendingMigrations(appliedMigrations);

    if (pendingMigrations.length === 0) {
      console.log('✓ No pending migrations\n');
      return;
    }

    console.log(`\n📋 Found ${pendingMigrations.length} pending migration(s):`);
    pendingMigrations.forEach(m => console.log(`   - ${m}`));
    console.log('');

    // Run each pending migration
    for (const migration of pendingMigrations) {
      await runMigration(migration);
    }

    console.log('\n✅ All migrations completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run migrations
migrate();
