-- Migrate Competition Director from separate field to role
-- This updates members who have is_comp_director = true to have role = 'competition_director'

-- Step 1: Update existing Competition Directors to use the new role
UPDATE members
SET role = 'competition_director'
WHERE is_comp_director = true;

-- Step 2: Remove the old is_comp_director field
ALTER TABLE members
DROP COLUMN IF EXISTS is_comp_director;

-- Note: This migration assumes you've already run add_comp_director_role.sql
-- If you haven't, you'll need to run that first to create the is_comp_director field