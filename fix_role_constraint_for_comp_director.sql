-- Fix role constraint to include competition_director
-- This updates the check constraint to allow the new competition_director role

-- First, drop the existing constraint
ALTER TABLE members DROP CONSTRAINT IF EXISTS check_valid_role;

-- Add the updated constraint that includes competition_director
ALTER TABLE members ADD CONSTRAINT check_valid_role
  CHECK (role IN ('member', 'officer', 'competition_director', 'vice_president', 'president'));

-- Now we can safely update existing Competition Directors
UPDATE members
SET role = 'competition_director'
WHERE is_comp_director = true;

-- Finally, remove the old is_comp_director field
ALTER TABLE members
DROP COLUMN IF EXISTS is_comp_director;