-- Custom Competition Categories and Ranking Groups Schema
-- This extends the competition system to support category restrictions and custom ranking

-- Add fields to competitions table for category management
ALTER TABLE competitions 
ADD COLUMN IF NOT EXISTS category_system TEXT DEFAULT 'default' CHECK (category_system IN ('default', 'custom')),
ADD COLUMN IF NOT EXISTS category_restrictions JSONB DEFAULT NULL;

-- Comment on new columns
COMMENT ON COLUMN competitions.category_system IS 'System for managing categories: default (all BJCP categories allowed) or custom (restricted categories)';
COMMENT ON COLUMN competitions.category_restrictions IS 'JSON array of allowed BJCP category IDs when using custom system';

-- Create competition ranking groups table
CREATE TABLE IF NOT EXISTS competition_ranking_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    group_name TEXT NOT NULL,
    group_description TEXT,
    bjcp_category_ids JSONB NOT NULL, -- Array of BJCP category UUIDs in this ranking group
    group_order INTEGER NOT NULL DEFAULT 1, -- For display ordering
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ranking_groups_competition ON competition_ranking_groups(competition_id);
CREATE INDEX IF NOT EXISTS idx_ranking_groups_order ON competition_ranking_groups(competition_id, group_order);

-- Unique constraint to ensure group names are unique within a competition
CREATE UNIQUE INDEX IF NOT EXISTS idx_ranking_groups_unique_name 
ON competition_ranking_groups(competition_id, group_name);

-- Add ranking group reference to competition_rankings table
ALTER TABLE competition_rankings
ADD COLUMN IF NOT EXISTS ranking_group_id UUID REFERENCES competition_ranking_groups(id) ON DELETE SET NULL;

-- Add index for the new column
CREATE INDEX IF NOT EXISTS idx_rankings_group ON competition_rankings(ranking_group_id);

-- Function to validate category restrictions
CREATE OR REPLACE FUNCTION validate_competition_entry_category()
RETURNS TRIGGER AS $$
DECLARE
    comp_category_system TEXT;
    comp_restrictions JSONB;
    entry_category_id UUID;
BEGIN
    -- Get competition category system and restrictions
    SELECT category_system, category_restrictions 
    INTO comp_category_system, comp_restrictions
    FROM competitions 
    WHERE id = NEW.competition_id;
    
    -- If using default system, allow all categories
    IF comp_category_system = 'default' THEN
        RETURN NEW;
    END IF;
    
    -- For custom system, check if category is allowed
    IF comp_category_system = 'custom' AND comp_restrictions IS NOT NULL THEN
        -- Check if the entry's category is in the allowed list
        IF NOT (comp_restrictions ? (NEW.bjcp_category_id::text)) THEN
            RAISE EXCEPTION 'Category % is not allowed in this competition', NEW.bjcp_category_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate entries against competition category restrictions
CREATE TRIGGER validate_entry_category_trigger
    BEFORE INSERT OR UPDATE ON competition_entries
    FOR EACH ROW
    EXECUTE FUNCTION validate_competition_entry_category();

-- Function to get allowed categories for a competition
CREATE OR REPLACE FUNCTION get_competition_allowed_categories(comp_id UUID)
RETURNS TABLE(
    id UUID,
    category_name TEXT,
    category_number TEXT,
    subcategory_letter TEXT,
    subcategory_name TEXT,
    ranking_group_name TEXT
) AS $$
BEGIN
    -- Check if competition uses custom category system
    IF (SELECT category_system FROM competitions WHERE competitions.id = comp_id) = 'custom' THEN
        -- Return only allowed categories with their ranking groups
        RETURN QUERY
        SELECT 
            bc.id,
            bc.category_name,
            bc.category_number,
            bc.subcategory_letter,
            bc.subcategory_name,
            crg.group_name as ranking_group_name
        FROM bjcp_categories bc
        LEFT JOIN competition_ranking_groups crg ON (
            crg.competition_id = comp_id AND
            crg.bjcp_category_ids ? bc.id::text
        )
        WHERE bc.id::text = ANY(
            SELECT jsonb_array_elements_text(category_restrictions) 
            FROM competitions 
            WHERE competitions.id = comp_id
        )
        ORDER BY bc.category_number, bc.subcategory_letter;
    ELSE
        -- Return all BJCP categories (default system)
        RETURN QUERY
        SELECT 
            bc.id,
            bc.category_name,
            bc.category_number,
            bc.subcategory_letter,
            bc.subcategory_name,
            NULL::TEXT as ranking_group_name
        FROM bjcp_categories bc
        ORDER BY bc.category_number, bc.subcategory_letter;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get ranking groups for a competition
CREATE OR REPLACE FUNCTION get_competition_ranking_groups(comp_id UUID)
RETURNS TABLE(
    id UUID,
    group_name TEXT,
    group_description TEXT,
    category_count INTEGER,
    entry_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        crg.id,
        crg.group_name,
        crg.group_description,
        jsonb_array_length(crg.bjcp_category_ids) as category_count,
        COUNT(ce.id)::INTEGER as entry_count
    FROM competition_ranking_groups crg
    LEFT JOIN competition_entries ce ON (
        ce.competition_id = crg.competition_id AND
        crg.bjcp_category_ids ? ce.bjcp_category_id::text
    )
    WHERE crg.competition_id = comp_id
    GROUP BY crg.id, crg.group_name, crg.group_description, crg.bjcp_category_ids
    ORDER BY crg.group_order, crg.group_name;
END;
$$ LANGUAGE plpgsql;

-- Update the competition_rankings table to use ranking groups
-- This will help with generating results grouped by custom ranking groups instead of individual categories

-- Example data for Scottish and Irish Beer competition
-- This shows how the system would work for the use case mentioned

-- INSERT INTO competitions (name, category_system, category_restrictions) VALUES 
-- ('Scottish and Irish Beer Championship', 'custom', '["category-14-uuid", "category-15-uuid"]');

-- INSERT INTO competition_ranking_groups (competition_id, group_name, group_description, bjcp_category_ids) VALUES
-- ('competition-uuid', 'Scottish and Irish Beers', 'Categories 14 and 15 ranked together', '["category-14-uuid", "category-15-uuid"]');

-- Success message
SELECT 'Competition custom categories schema created successfully!' as message;