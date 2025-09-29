-- Prevent users from ranking their own entries in top 3 positions during intraclub competitions
-- This trigger provides server-side validation as the final safeguard

CREATE OR REPLACE FUNCTION validate_intraclub_self_ranking()
RETURNS TRIGGER AS $$
BEGIN
    -- Only validate for top 3 positions (1st, 2nd, 3rd place)
    IF NEW.rank_position <= 3 THEN
        -- Check if this is an intraclub competition
        IF EXISTS (
            SELECT 1 FROM competitions
            WHERE id = NEW.competition_id
            AND competition_type = 'intraclub'
        ) THEN
            -- Check if judge is trying to rank their own entry
            IF EXISTS (
                SELECT 1 FROM competition_entries
                WHERE id = NEW.entry_id
                AND member_id = NEW.judge_id
            ) THEN
                RAISE EXCEPTION 'Cannot rank your own entry in positions 1-3 during intraclub competitions. Entry ID: %, Position: %', NEW.entry_id, NEW.rank_position;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires before insert or update
CREATE TRIGGER prevent_intraclub_self_ranking_trigger
    BEFORE INSERT OR UPDATE ON competition_rankings
    FOR EACH ROW
    EXECUTE FUNCTION validate_intraclub_self_ranking();

-- Add helpful comment
COMMENT ON FUNCTION validate_intraclub_self_ranking() IS
'Prevents judges from ranking their own entries in positions 1-3 during intraclub competitions to maintain fairness';