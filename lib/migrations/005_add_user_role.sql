-- Migration 005: Add role column to users table
-- Description: Adds a basic role system. 'admin' users can manage invites.
--              The first registered user is assigned 'admin' via application logic.

ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
