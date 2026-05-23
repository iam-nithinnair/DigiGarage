-- ============================================================
-- DigiGarage: Add / Re-populate case_code column  (v2)
-- Run this in Supabase SQL Editor
-- Safe to re-run — overwrites previous values
-- ============================================================
--
-- Hot Wheels mainline: ~16 new models per case wave.
-- Letters I and O are SKIPPED (look like 1 and 0):
--   A = #001-016   B = #017-032   C = #033-048   D = #049-064
--   E = #065-080   F = #081-096   G = #097-112   H = #113-128
--   J = #129-144   K = #145-160   L = #161-176   M = #177-192
--   N = #193-208   P = #209-224   Q = #225-240
--
-- 15 case letters × 16 models per case = 240 models max per year.
-- Only applies to entries with valid numeric collector_number (1-240).
-- Older models (pre-1995) often have colour names or empty
-- collector_numbers and correctly receive NULL.
-- ============================================================

-- 1. Add case_code column (no-op if already exists)
ALTER TABLE public.hotwheels_catalog ADD COLUMN IF NOT EXISTS case_code TEXT;

-- 2. Reset all case_code values first (safe re-run)
UPDATE public.hotwheels_catalog SET case_code = NULL;

-- 3. Populate case_code using a lookup array that skips I and O
UPDATE public.hotwheels_catalog
SET case_code =
  CASE
    WHEN collector_number ~ '^\d+$'
         AND CAST(collector_number AS INTEGER) BETWEEN 1 AND 240
    THEN (ARRAY['A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q'])[
      ((CAST(collector_number AS INTEGER) - 1) / 16) + 1
    ]
    ELSE NULL
  END;

-- 4. Index for fast filtering
CREATE INDEX IF NOT EXISTS idx_catalog_case_code ON public.hotwheels_catalog(case_code);

-- 5. Verify — should show cases A through Q (no I or O) with counts
SELECT case_code, COUNT(*) AS cnt
FROM public.hotwheels_catalog
WHERE case_code IS NOT NULL
GROUP BY case_code
ORDER BY case_code;
