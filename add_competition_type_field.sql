-- Add competition_type field to competitions table
-- This allows distinguishing between regular competitions and intraclub competitions

ALTER TABLE competitions
ADD COLUMN IF NOT EXISTS competition_type TEXT DEFAULT 'regular'
CHECK (competition_type IN ('regular', 'intraclub', 'sanctioned'));

-- Update existing competitions to use 'regular' as default
UPDATE competitions
SET competition_type = 'regular'
WHERE competition_type IS NULL;

-- Add comment to document the field
COMMENT ON COLUMN competitions.competition_type IS 'Type of competition: regular (standard), intraclub (club members only), sanctioned (official BJCP)';