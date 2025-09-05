-- Add scoresheet_data column to existing competition_judging_sessions table
-- This is a safe migration that preserves all existing data

ALTER TABLE competition_judging_sessions 
ADD COLUMN IF NOT EXISTS scoresheet_data JSONB;

-- Add a comment to document the column
COMMENT ON COLUMN competition_judging_sessions.scoresheet_data IS 'Complete BJCP scoresheet data including descriptors, assessments, and detailed comments stored as JSON';

-- Success message
SELECT 'Scoresheet data column added successfully!' as message;