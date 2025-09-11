-- Fix competition_rankings table to allow bjcp_category_id to be nullable
-- when using custom ranking groups

-- Make bjcp_category_id nullable to support custom ranking groups
ALTER TABLE competition_rankings 
ALTER COLUMN bjcp_category_id DROP NOT NULL;

-- Add a constraint to ensure either bjcp_category_id OR ranking_group_id is provided
-- but not both at the same time
ALTER TABLE competition_rankings
ADD CONSTRAINT check_category_or_group 
CHECK (
  (bjcp_category_id IS NOT NULL AND ranking_group_id IS NULL) OR
  (bjcp_category_id IS NULL AND ranking_group_id IS NOT NULL)
);

-- Add a comment to explain the constraint
COMMENT ON CONSTRAINT check_category_or_group ON competition_rankings IS 
'Ensures that either bjcp_category_id (for individual category rankings) OR ranking_group_id (for custom group rankings) is provided, but not both.';