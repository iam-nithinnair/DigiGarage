-- ============================================================
-- DigiGarage: Clean series column — strip wiki markup artifacts
-- Run this in Supabase SQL Editor
-- Safe to re-run — idempotent
-- ============================================================
--
-- Fixes two classes of dirt in the `series` column:
--   1. Cell attributes:  bgcolor="#231F20"|HW Dream Garage  →  HW Dream Garage
--   2. Wiki templates:   Factory Fresh {{NM|2025}} {{KR}}   →  Factory Fresh
--
-- Also drops the always-empty `color` and `case_code` columns.
-- ============================================================

-- 1. Strip bgcolor="..." / style="..." attribute prefixes (up to the pipe)
--    e.g.  bgcolor="#231F20"|HW Dream Garage  →  HW Dream Garage
UPDATE public.hotwheels_catalog
SET series = TRIM(
  regexp_replace(
    series,
    '^\s*(?:(?:bgcolor|style|align|valign|width|height)\s*=\s*"[^"]*"\s*)+\|?\s*',
    '',
    'i'
  )
)
WHERE series ~ '(?i)^(bgcolor|style|align|valign|width|height)\s*=';

-- 2. Strip all wiki templates  {{...}}
--    e.g.  Factory Fresh {{NM|2025}} {{KR}}  →  Factory Fresh
UPDATE public.hotwheels_catalog
SET series = TRIM(regexp_replace(series, '\{\{[^}]*?\}\}', '', 'g'))
WHERE series ~ '\{\{';

-- 3. Collapse double spaces left by template removal
UPDATE public.hotwheels_catalog
SET series = TRIM(regexp_replace(series, '\s{2,}', ' ', 'g'))
WHERE series ~ '\s{2,}';

-- 4. Set empty-string series to NULL for consistency
UPDATE public.hotwheels_catalog
SET series = NULL
WHERE series = '';

-- 5. Drop the always-empty color column (wiki has no color data)
ALTER TABLE public.hotwheels_catalog DROP COLUMN IF EXISTS color;

-- 6. Drop the case_code column (no reliable source for case data)
ALTER TABLE public.hotwheels_catalog DROP COLUMN IF EXISTS case_code;
DROP INDEX IF EXISTS idx_catalog_case_code;

-- 7. Verify — show cleaned unique series sorted
SELECT series, COUNT(*) AS cnt
FROM public.hotwheels_catalog
WHERE series IS NOT NULL
GROUP BY series
ORDER BY series
LIMIT 50;
