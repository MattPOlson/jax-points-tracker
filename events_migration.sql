-- Events Migration
-- Adds support for club events (beer festivals, pours, etc.) with member signups.
-- Run this in your Supabase SQL editor.

-- =============================================
-- 1. events table
-- =============================================
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    event_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    signup_deadline TIMESTAMPTZ,
    max_attendees INTEGER,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES members(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(active);

-- =============================================
-- 2. event_signups table
-- =============================================
CREATE TABLE IF NOT EXISTS event_signups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    bringing TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_event_signups_event ON event_signups(event_id);
CREATE INDEX IF NOT EXISTS idx_event_signups_member ON event_signups(member_id);

-- =============================================
-- 3. updated_at triggers
-- =============================================
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_signups_updated_at
    BEFORE UPDATE ON event_signups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 4. Row Level Security
-- =============================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_signups ENABLE ROW LEVEL SECURITY;

-- Events: any authenticated member can read active events; officers can read all.
CREATE POLICY "Members can view active events"
    ON events FOR SELECT
    TO authenticated
    USING (
        active = TRUE
        OR EXISTS (
            SELECT 1 FROM members
            WHERE members.id = auth.uid()
            AND members.is_officer = TRUE
        )
    );

-- Events: only officers can insert / update / delete.
CREATE POLICY "Officers can manage events"
    ON events FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM members
            WHERE members.id = auth.uid()
            AND members.is_officer = TRUE
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM members
            WHERE members.id = auth.uid()
            AND members.is_officer = TRUE
        )
    );

-- Event signups: authenticated members can see signups for events they can see.
CREATE POLICY "Members can view event signups"
    ON event_signups FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM events
            WHERE events.id = event_signups.event_id
            AND (
                events.active = TRUE
                OR EXISTS (
                    SELECT 1 FROM members
                    WHERE members.id = auth.uid()
                    AND members.is_officer = TRUE
                )
            )
        )
    );

-- Event signups: members can insert / update / delete their own signup.
CREATE POLICY "Members can insert own signup"
    ON event_signups FOR INSERT
    TO authenticated
    WITH CHECK (member_id = auth.uid());

CREATE POLICY "Members can update own signup"
    ON event_signups FOR UPDATE
    TO authenticated
    USING (member_id = auth.uid())
    WITH CHECK (member_id = auth.uid());

CREATE POLICY "Members can delete own signup"
    ON event_signups FOR DELETE
    TO authenticated
    USING (member_id = auth.uid());

-- Event signups: officers can manage any signup.
CREATE POLICY "Officers can manage event signups"
    ON event_signups FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM members
            WHERE members.id = auth.uid()
            AND members.is_officer = TRUE
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM members
            WHERE members.id = auth.uid()
            AND members.is_officer = TRUE
        )
    );
