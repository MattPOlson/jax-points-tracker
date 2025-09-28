-- Add Competition Director role to members table
-- This allows designating a specific member as the competition director
-- who has special access to entries and judging data

ALTER TABLE members
ADD COLUMN IF NOT EXISTS is_comp_director BOOLEAN DEFAULT FALSE;

-- Add comment to document the field
COMMENT ON COLUMN members.is_comp_director IS 'Whether this member is designated as Competition Director with special access to competition entries and judging data';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_members_is_comp_director ON members(is_comp_director) WHERE is_comp_director = true;