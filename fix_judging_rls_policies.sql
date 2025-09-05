-- Fix RLS policies for competition judging system
-- Run this if you're getting 401 errors when trying to save judging scores

-- First, ensure RLS is enabled on the table
ALTER TABLE competition_judging_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Officers can manage all judging sessions" ON competition_judging_sessions;
DROP POLICY IF EXISTS "Judges can manage their own sessions" ON competition_judging_sessions;
DROP POLICY IF EXISTS "Entry owners can view their results" ON competition_judging_sessions;

-- Create policies for competition_judging_sessions

-- 1. Officers can manage all judging sessions
CREATE POLICY "Officers can manage all judging sessions" ON competition_judging_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM members 
            WHERE members.id = auth.uid() 
            AND members.is_officer = true
        )
    );

-- 2. Judges can manage their own judging sessions
CREATE POLICY "Judges can manage their own sessions" ON competition_judging_sessions
    FOR ALL USING (judge_id = auth.uid());

-- 3. Entry owners can view judging results (but not private notes)
CREATE POLICY "Entry owners can view their results" ON competition_judging_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM competition_entries 
            WHERE competition_entries.id = entry_id 
            AND competition_entries.member_id = auth.uid()
        )
    );

-- Also make sure competition_judges table has proper policies
ALTER TABLE competition_judges ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Officers can manage all judge assignments" ON competition_judges;
DROP POLICY IF EXISTS "Judges can view their own assignments" ON competition_judges;

-- Recreate policies for competition_judges
CREATE POLICY "Officers can manage all judge assignments" ON competition_judges
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM members 
            WHERE members.id = auth.uid() 
            AND members.is_officer = true
        )
    );

CREATE POLICY "Judges can view their own assignments" ON competition_judges
    FOR SELECT USING (judge_id = auth.uid());

-- Create policy for competition_rankings if it doesn't exist
ALTER TABLE competition_rankings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Officers can manage all rankings" ON competition_rankings;
DROP POLICY IF EXISTS "Judges can manage their own rankings" ON competition_rankings;
DROP POLICY IF EXISTS "Entry owners can view their rankings" ON competition_rankings;

CREATE POLICY "Officers can manage all rankings" ON competition_rankings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM members 
            WHERE members.id = auth.uid() 
            AND members.is_officer = true
        )
    );

CREATE POLICY "Judges can manage their own rankings" ON competition_rankings
    FOR ALL USING (judge_id = auth.uid());

CREATE POLICY "Entry owners can view their rankings" ON competition_rankings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM competition_entries 
            WHERE competition_entries.id = entry_id 
            AND competition_entries.member_id = auth.uid()
        )
    );

-- Success message
SELECT 'RLS policies for judging system created successfully!' as message;