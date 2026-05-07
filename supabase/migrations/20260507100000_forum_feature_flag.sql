-- Forum Feature Flag
-- Gates all forum access on a per-member opt-in flag.
-- Default FALSE for everyone (officers included). Officers toggle members on
-- via /officers/members. Run in the Supabase SQL editor after the forum
-- schema migration.

-- =============================================
-- 1. forum_beta column on members
-- =============================================
ALTER TABLE members
    ADD COLUMN IF NOT EXISTS forum_beta BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_members_forum_beta
    ON members(forum_beta) WHERE forum_beta = TRUE;

-- =============================================
-- 2. RESTRICTIVE policies — AND'd with all existing PERMISSIVE policies
--    so we can gate forum access without rewriting every existing policy.
-- =============================================
CREATE POLICY "forum_beta_required"
    ON forum_categories AS RESTRICTIVE
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM members
             WHERE members.id = auth.uid()
               AND members.forum_beta = TRUE
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM members
             WHERE members.id = auth.uid()
               AND members.forum_beta = TRUE
        )
    );

CREATE POLICY "forum_beta_required"
    ON forum_topics AS RESTRICTIVE
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM members
             WHERE members.id = auth.uid()
               AND members.forum_beta = TRUE
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM members
             WHERE members.id = auth.uid()
               AND members.forum_beta = TRUE
        )
    );

CREATE POLICY "forum_beta_required"
    ON forum_posts AS RESTRICTIVE
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM members
             WHERE members.id = auth.uid()
               AND members.forum_beta = TRUE
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM members
             WHERE members.id = auth.uid()
               AND members.forum_beta = TRUE
        )
    );
