-- ============================================================
-- Migration 0001: User-level RLS policies for `models` table
-- DigiGarage — Phase 1: Database & Auth Hardening
--
-- Purpose:
--   The `models` table stores each user's personal collection.
--   Admin-level RLS policies already exist (from supabase-admin-setup.sql)
--   but user-level policies are MISSING — meaning regular authenticated
--   users cannot read, insert, update, or delete their own rows via
--   the Supabase client (PostgREST).
--
--   This migration adds the four standard user-scoped policies so that
--   each user can only access rows where `user_id` matches their JWT.
--
-- Idempotency:
--   Uses DO $$ ... END $$ blocks with pg_policies catalog checks so
--   that re-running this script is a no-op if policies already exist.
--   Existing admin policies are NOT touched.
--
-- Run in: Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Ensure RLS is enabled (idempotent — no-op if already on)
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

-- ------------------------------------
-- 1. SELECT — users can read their own models
-- ------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'models'
      AND policyname = 'Users can view own models'
  ) THEN
    CREATE POLICY "Users can view own models"
      ON public.models
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- ------------------------------------
-- 2. INSERT — users can add models to their own collection
--    WITH CHECK ensures the incoming row's user_id matches the caller.
-- ------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'models'
      AND policyname = 'Users can insert own models'
  ) THEN
    CREATE POLICY "Users can insert own models"
      ON public.models
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- ------------------------------------
-- 3. UPDATE — users can modify only their own models
--    USING gates which rows are visible for update;
--    WITH CHECK ensures the updated row still belongs to the same user
--    (prevents user_id reassignment).
-- ------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'models'
      AND policyname = 'Users can update own models'
  ) THEN
    CREATE POLICY "Users can update own models"
      ON public.models
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- ------------------------------------
-- 4. DELETE — users can remove only their own models
-- ------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'models'
      AND policyname = 'Users can delete own models'
  ) THEN
    CREATE POLICY "Users can delete own models"
      ON public.models
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- ============================================================
-- Verification query (optional — uncomment to check policies)
-- ============================================================
-- SELECT policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'models'
-- ORDER BY policyname;
