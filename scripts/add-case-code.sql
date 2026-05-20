-- ============================================================
-- DigiGarage: Add / Re-populate case_code column
-- Run this in Supabase SQL Editor
-- Safe to re-run — overwrites previous values
-- ============================================================

-- 1. Add case_code column (no-op if already exists)
ALTER TABLE public.hotwheels_catalog ADD COLUMN IF NOT EXISTS case_code TEXT;

-- 2. Reset all case_code values first (safe re-run)
UPDATE public.hotwheels_catalog SET case_code = NULL;

-- 3. Populate case_code from collector_number
--    Hot Wheels mainline: ~16 new models per case wave (A–P):
--    A = #001-016, B = #017-032, C = #033-048, D = #049-064,
--    E = #065-080, F = #081-096, G = #097-112, H = #113-128,
--    I = #129-144, J = #145-160, K = #161-176, L = #177-192,
--    M = #193-208, N = #209-224, O = #225-240, P = #241-256
--
--    Only applies to entries with valid numeric collector_number (1-256).
--    Older models (pre-1995) often have color names or empty collector_numbers
--    and will get NULL case_code (correctly excluded from case filtering).
UPDATE public.hotwheels_catalog
SET case_code =
  CASE
    WHEN collector_number ~ '^\d+$'
         AND CAST(collector_number AS INTEGER) BETWEEN 1 AND 256
    THEN CHR(65 + ((CAST(collector_number AS INTEGER) - 1) / 16))
    ELSE NULL
  END;

-- 4. Index for fast filtering
CREATE INDEX IF NOT EXISTS idx_catalog_case_code ON public.hotwheels_catalog(case_code);

-- 5. Verify — should show cases A through P with counts
SELECT case_code, COUNT(*) AS cnt
FROM public.hotwheels_catalog
WHERE case_code IS NOT NULL
GROUP BY case_code
ORDER BY case_code;
