-- Judging Tables Migration
-- Run this in your Supabase SQL editor

-- 1. Create the judging_tables table
CREATE TABLE IF NOT EXISTS judging_tables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    table_number INTEGER NOT NULL,
    table_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(competition_id, table_number)
);

CREATE INDEX IF NOT EXISTS idx_judging_tables_competition ON judging_tables(competition_id);

-- 2. Add table_id to competition_judges
ALTER TABLE competition_judges
    ADD COLUMN IF NOT EXISTS table_id UUID REFERENCES judging_tables(id) ON DELETE SET NULL;

-- 3. Add table_id to competition_entries
ALTER TABLE competition_entries
    ADD COLUMN IF NOT EXISTS table_id UUID REFERENCES judging_tables(id) ON DELETE SET NULL;

-- 4. Enable Row Level Security on judging_tables
ALTER TABLE judging_tables ENABLE ROW LEVEL SECURITY;

-- Policy: Officers (is_officer = true) can do all operations
CREATE POLICY "Officers can manage judging tables"
    ON judging_tables
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM members
            WHERE members.id = auth.uid()
            AND members.is_officer = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM members
            WHERE members.id = auth.uid()
            AND members.is_officer = true
        )
    );

-- Policy: Active judges can select tables for their competition
CREATE POLICY "Judges can view their competition tables"
    ON judging_tables
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM competition_judges
            WHERE competition_judges.competition_id = judging_tables.competition_id
            AND competition_judges.judge_id = auth.uid()
            AND competition_judges.active = true
        )
    );

-- 5. Add updated_at trigger (reuses the existing update_updated_at_column function)
CREATE TRIGGER update_judging_tables_updated_at
    BEFORE UPDATE ON judging_tables
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
