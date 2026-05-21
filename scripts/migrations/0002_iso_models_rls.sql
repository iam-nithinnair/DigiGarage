-- ============================================================
-- Migration 0002: User-level RLS policies for `iso_models` table
-- DigiGarage — Phase 1: Database & Auth Hardening
--
-- Purpose:
--   The `iso_models` table stores each user's wishlist ("In Search Of").
--   Like `models`, admin-level policies already exist but user-level
--   policies are MISSING. Without these, regular users cannot interact
--   with their own wishlist rows through the Supabase client.
--
--   This migration mirrors the pattern from 0001_models_rls.sql:
--   four user-scoped policies gated on `auth.uid() = user_id`.
--
-- Idempotency:
--   Uses DO $$ ... END $$ blocks with pg_policies catalog checks.
--   Existing admin policies are NOT touched.
--
-- Run in: Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Ensure RLS is enabled (idempotent — no-op if already on)
ALTER TABLE public.iso_models ENABLE ROW LEVEL SECURITY;

-- ------------------------------------
-- 1. SELECT — users can read their own wishlist items
-- ------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'iso_models'
      AND policyname = 'Users can view own iso_models'
  ) THEN
    CREATE POLICY "Users can view own iso_models"
      ON public.iso_models
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- ------------------------------------
-- 2. INSERT — users can add items to their own wishlist
-- ------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'iso_models'
      AND policyname = 'Users can insert own iso_models'
  ) THEN
    CREATE POLICY "Users can insert own iso_models"
      ON public.iso_models
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- ------------------------------------
-- 3. UPDATE — users can modify only their own wishlist items
--    WITH CHECK prevents user_id reassignment on update.
-- ------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'iso_models'
      AND policyname = 'Users can update own iso_models'
  ) THEN
    CREATE POLICY "Users can update own iso_models"
      ON public.iso_models
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- ------------------------------------
-- 4. DELETE — users can remove only their own wishlist items
-- ------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'iso_models'
      AND policyname = 'Users can delete own iso_models'
  ) THEN
    CREATE POLICY "Users can delete own iso_models"
      ON public.iso_models
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
-- WHERE schemaname = 'public' AND tablename = 'iso_models'
-- ORDER BY policyname;
