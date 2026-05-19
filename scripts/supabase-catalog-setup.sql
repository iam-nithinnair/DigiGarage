-- ============================================================
-- DigiGarage: Hot Wheels Catalog Table Setup
-- Run this in Supabase SQL Editor BEFORE seeding data
-- ============================================================

-- 1. Create the catalog table (public read-only reference data)
CREATE TABLE IF NOT EXISTS public.hotwheels_catalog (
  catalog_id SERIAL PRIMARY KEY,
  toy_number TEXT,
  collector_number TEXT,
  model_name TEXT NOT NULL,
  series TEXT,
  series_number TEXT,
  year INTEGER NOT NULL,
  image_filename TEXT,
  color TEXT,
  manufacturer TEXT DEFAULT 'Hot Wheels',
  scale TEXT DEFAULT '1:64'
);

-- 2. Create indexes for fast filtering/search
CREATE INDEX IF NOT EXISTS idx_catalog_year ON public.hotwheels_catalog(year);
CREATE INDEX IF NOT EXISTS idx_catalog_series ON public.hotwheels_catalog(series);
CREATE INDEX IF NOT EXISTS idx_catalog_model_name ON public.hotwheels_catalog(model_name);
CREATE INDEX IF NOT EXISTS idx_catalog_name_search ON public.hotwheels_catalog USING gin(to_tsvector('english', model_name));

-- 3. Enable RLS
ALTER TABLE public.hotwheels_catalog ENABLE ROW LEVEL SECURITY;

-- 4. Everyone can read the catalog (it's public reference data)
CREATE POLICY "Anyone can view catalog"
  ON public.hotwheels_catalog FOR SELECT
  USING (true);

-- 5. Only admins can modify catalog
CREATE POLICY "Admins can insert catalog"
  ON public.hotwheels_catalog FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update catalog"
  ON public.hotwheels_catalog FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete catalog"
  ON public.hotwheels_catalog FOR DELETE
  USING (public.is_admin());
