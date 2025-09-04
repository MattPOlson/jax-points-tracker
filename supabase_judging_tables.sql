-- Digital Judging System Database Tables
-- Run these SQL commands in your Supabase SQL Editor

-- 1. Competition Judges Table
-- Links judges to competitions with role assignments
CREATE TABLE IF NOT EXISTS competition_judges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    judge_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    judge_role TEXT NOT NULL DEFAULT 'club_judge' CHECK (judge_role IN ('bjcp_judge', 'club_judge', 'guest_judge')),
    assignment_notes TEXT,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES members(id),
    active BOOLEAN DEFAULT TRUE,
    removed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_competition_judges_competition ON competition_judges(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_judges_judge ON competition_judges(judge_id);
CREATE INDEX IF NOT EXISTS idx_competition_judges_active ON competition_judges(competition_id, active) WHERE active = true;

-- Unique constraint to prevent duplicate judge assignments
CREATE UNIQUE INDEX IF NOT EXISTS idx_competition_judges_unique 
ON competition_judges(competition_id, judge_id) WHERE active = true;

-- 2. Competition Judging Sessions Table
-- Detailed scoring and notes for each judge's evaluation of entries
CREATE TABLE IF NOT EXISTS competition_judging_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    entry_id UUID NOT NULL REFERENCES competition_entries(id) ON DELETE CASCADE,
    judge_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    
    -- BJCP Score Categories (out of 50 total)
    aroma_score INTEGER CHECK (aroma_score >= 0 AND aroma_score <= 12),
    appearance_score INTEGER CHECK (appearance_score >= 0 AND appearance_score <= 3),
    flavor_score INTEGER CHECK (flavor_score >= 0 AND flavor_score <= 20),
    mouthfeel_score INTEGER CHECK (mouthfeel_score >= 0 AND mouthfeel_score <= 5),
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 10),
    total_score INTEGER GENERATED ALWAYS AS (
        COALESCE(aroma_score, 0) + 
        COALESCE(appearance_score, 0) + 
        COALESCE(flavor_score, 0) + 
        COALESCE(mouthfeel_score, 0) + 
        COALESCE(overall_score, 0)
    ) STORED,
    
    -- Judge feedback
    judge_notes TEXT, -- Public notes visible to entrant
    private_notes TEXT, -- Private notes only visible to judges/officers
    
    -- Session metadata
    judged_at TIMESTAMPTZ DEFAULT NOW(),
    session_duration_minutes INTEGER, -- How long judging took
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_judging_sessions_competition ON competition_judging_sessions(competition_id);
CREATE INDEX IF NOT EXISTS idx_judging_sessions_entry ON competition_judging_sessions(entry_id);
CREATE INDEX IF NOT EXISTS idx_judging_sessions_judge ON competition_judging_sessions(judge_id);

-- Unique constraint to prevent duplicate scoring by same judge
CREATE UNIQUE INDEX IF NOT EXISTS idx_judging_sessions_unique 
ON competition_judging_sessions(competition_id, entry_id, judge_id);

-- 3. Competition Rankings Table
-- Rankings assigned by judges within categories
CREATE TABLE IF NOT EXISTS competition_rankings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    judge_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    bjcp_category_id UUID NOT NULL REFERENCES bjcp_categories(id),
    entry_id UUID NOT NULL REFERENCES competition_entries(id) ON DELETE CASCADE,
    rank_position INTEGER NOT NULL CHECK (rank_position > 0),
    ranking_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rankings_competition ON competition_rankings(competition_id);
CREATE INDEX IF NOT EXISTS idx_rankings_judge ON competition_rankings(judge_id);
CREATE INDEX IF NOT EXISTS idx_rankings_category ON competition_rankings(bjcp_category_id);
CREATE INDEX IF NOT EXISTS idx_rankings_entry ON competition_rankings(entry_id);

-- Unique constraint to prevent duplicate rankings
CREATE UNIQUE INDEX IF NOT EXISTS idx_rankings_unique_entry 
ON competition_rankings(competition_id, judge_id, bjcp_category_id, entry_id);

-- Unique constraint to prevent duplicate rank positions per judge/category
CREATE UNIQUE INDEX IF NOT EXISTS idx_rankings_unique_position 
ON competition_rankings(competition_id, judge_id, bjcp_category_id, rank_position);

-- 4. Add RLS (Row Level Security) Policies

-- Competition Judges policies
ALTER TABLE competition_judges ENABLE ROW LEVEL SECURITY;

-- Officers can manage all judge assignments
CREATE POLICY "Officers can manage all judge assignments" ON competition_judges
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM members 
            WHERE members.id = auth.uid() 
            AND members.is_officer = true
        )
    );

-- Judges can view their own assignments
CREATE POLICY "Judges can view their own assignments" ON competition_judges
    FOR SELECT USING (judge_id = auth.uid());

-- Competition Judging Sessions policies
ALTER TABLE competition_judging_sessions ENABLE ROW LEVEL SECURITY;

-- Officers can manage all judging sessions
CREATE POLICY "Officers can manage all judging sessions" ON competition_judging_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM members 
            WHERE members.id = auth.uid() 
            AND members.is_officer = true
        )
    );

-- Judges can manage their own judging sessions
CREATE POLICY "Judges can manage their own sessions" ON competition_judging_sessions
    FOR ALL USING (judge_id = auth.uid());

-- Entry owners can view judging results (but not private notes)
CREATE POLICY "Entry owners can view their results" ON competition_judging_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM competition_entries 
            WHERE competition_entries.id = entry_id 
            AND competition_entries.member_id = auth.uid()
        )
    );

-- Competition Rankings policies
ALTER TABLE competition_rankings ENABLE ROW LEVEL SECURITY;

-- Officers can manage all rankings
CREATE POLICY "Officers can manage all rankings" ON competition_rankings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM members 
            WHERE members.id = auth.uid() 
            AND members.is_officer = true
        )
    );

-- Judges can manage their own rankings
CREATE POLICY "Judges can manage their own rankings" ON competition_rankings
    FOR ALL USING (judge_id = auth.uid());

-- Entry owners can view rankings of their entries
CREATE POLICY "Entry owners can view their rankings" ON competition_rankings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM competition_entries 
            WHERE competition_entries.id = entry_id 
            AND competition_entries.member_id = auth.uid()
        )
    );

-- 5. Create useful views for common queries

-- View: Judge Assignment Summary
CREATE OR REPLACE VIEW judge_assignment_summary AS
SELECT 
    cj.competition_id,
    c.name as competition_name,
    cj.judge_id,
    m.name as judge_name,
    m.email as judge_email,
    cj.judge_role,
    cj.assigned_at,
    cj.active,
    COUNT(DISTINCT ce.id) as total_entries,
    COUNT(DISTINCT cjs.entry_id) as entries_judged,
    CASE 
        WHEN COUNT(DISTINCT ce.id) = 0 THEN 0
        ELSE ROUND((COUNT(DISTINCT cjs.entry_id)::DECIMAL / COUNT(DISTINCT ce.id)) * 100, 1)
    END as completion_percentage
FROM competition_judges cj
JOIN competitions c ON c.id = cj.competition_id
JOIN members m ON m.id = cj.judge_id
LEFT JOIN competition_entries ce ON ce.competition_id = cj.competition_id
LEFT JOIN competition_judging_sessions cjs ON cjs.competition_id = cj.competition_id 
    AND cjs.judge_id = cj.judge_id
WHERE cj.active = true
GROUP BY cj.competition_id, c.name, cj.judge_id, m.name, m.email, cj.judge_role, cj.assigned_at, cj.active;

-- View: Entry Judging Summary
CREATE OR REPLACE VIEW entry_judging_summary AS
SELECT 
    ce.id as entry_id,
    ce.competition_id,
    ce.entry_number,
    ce.beer_name,
    ce.member_id,
    m.name as member_name,
    bc.category_name,
    bc.subcategory_name,
    COUNT(cjs.id) as judges_count,
    AVG(cjs.total_score) as average_score,
    MAX(cjs.total_score) as highest_score,
    MIN(cjs.total_score) as lowest_score,
    COUNT(cjs.id) > 0 as has_been_judged,
    STRING_AGG(DISTINCT jm.name, ', ') as judge_names
FROM competition_entries ce
JOIN members m ON m.id = ce.member_id
LEFT JOIN bjcp_categories bc ON bc.id = ce.bjcp_category_id
LEFT JOIN competition_judging_sessions cjs ON cjs.entry_id = ce.id
LEFT JOIN members jm ON jm.id = cjs.judge_id
GROUP BY ce.id, ce.competition_id, ce.entry_number, ce.beer_name, ce.member_id, 
         m.name, bc.category_name, bc.subcategory_name;

-- 6. Add triggers for updated_at timestamps

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_competition_judges_updated_at 
    BEFORE UPDATE ON competition_judges 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competition_judging_sessions_updated_at 
    BEFORE UPDATE ON competition_judging_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competition_rankings_updated_at 
    BEFORE UPDATE ON competition_rankings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Digital judging system tables created successfully!' as message;