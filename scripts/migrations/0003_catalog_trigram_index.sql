-- ============================================================
-- Migration 0003: Trigram fuzzy-search index on `hotwheels_catalog`
-- DigiGarage — Phase 1: Database & Auth Hardening
--
-- Purpose:
--   The catalog already has a full-text-search (tsvector) index on
--   `model_name`, but that only matches whole stemmed words. Users
--   frequently search with partial strings or typos (e.g., "Camero"
--   instead of "Camaro", "67 Must" instead of "67 Mustang").
--
--   The pg_trgm extension enables trigram-based similarity and ILIKE
--   acceleration. A GIN trigram index on `model_name` lets Postgres
--   use the index for:
--     - `WHERE model_name ILIKE '%mustang%'`  (prefix / substring)
--     - `WHERE model_name % 'camero'`         (fuzzy similarity)
--     - `ORDER BY model_name <-> 'camero'`    (distance ranking)
--
--   With 10,567+ catalog rows this turns sequential scans into fast
--   index scans for the Discover page search bar.
--
-- Idempotency:
--   Both statements use IF NOT EXISTS — safe to re-run.
--
-- Run in: Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Enable the pg_trgm extension (ships with Supabase/Postgres)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Create a GIN trigram index on model_name
--    This accelerates ILIKE, similarity(), and trigram distance operators.
CREATE INDEX IF NOT EXISTS idx_catalog_model_name_trgm
  ON public.hotwheels_catalog
  USING GIN (model_name gin_trgm_ops);

-- ============================================================
-- Usage examples (for reference — do not uncomment in production)
-- ============================================================
-- Fuzzy search with similarity threshold:
--   SELECT model_name, similarity(model_name, 'Camero') AS sim
--   FROM hotwheels_catalog
--   WHERE model_name % 'Camero'
--   ORDER BY sim DESC
--   LIMIT 20;
--
-- Substring / ILIKE search (now index-backed):
--   SELECT model_name, year, series
--   FROM hotwheels_catalog
--   WHERE model_name ILIKE '%mustang%'
--   ORDER BY year DESC;
