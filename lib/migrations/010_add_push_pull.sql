-- Migration: 010_add_push_pull
-- Description: Add push_pull column to rolls for tracking push/pull processing
-- Date: 2026-03-08

ALTER TABLE rolls ADD COLUMN IF NOT EXISTS push_pull NUMERIC(4,1);
