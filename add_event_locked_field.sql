-- Add `locked` flag to events
-- When TRUE, members cannot create or modify their own signups for the event.
-- Officers can still manage signups (add / remove) regardless of lock state.
-- Run this in your Supabase SQL editor.

ALTER TABLE events
    ADD COLUMN IF NOT EXISTS locked BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_events_locked ON events(locked);

-- Block member-side INSERT / UPDATE / DELETE on event_signups when the parent
-- event is locked. Officers continue to bypass via the existing
-- "Officers can manage event signups" policy.
DROP POLICY IF EXISTS "Members can insert own signup" ON event_signups;
DROP POLICY IF EXISTS "Members can update own signup" ON event_signups;
DROP POLICY IF EXISTS "Members can delete own signup" ON event_signups;

CREATE POLICY "Members can insert own signup"
    ON event_signups FOR INSERT
    TO authenticated
    WITH CHECK (
        member_id = auth.uid()
        AND NOT EXISTS (
            SELECT 1 FROM events
            WHERE events.id = event_signups.event_id
            AND events.locked = TRUE
        )
    );

CREATE POLICY "Members can update own signup"
    ON event_signups FOR UPDATE
    TO authenticated
    USING (
        member_id = auth.uid()
        AND NOT EXISTS (
            SELECT 1 FROM events
            WHERE events.id = event_signups.event_id
            AND events.locked = TRUE
        )
    )
    WITH CHECK (
        member_id = auth.uid()
        AND NOT EXISTS (
            SELECT 1 FROM events
            WHERE events.id = event_signups.event_id
            AND events.locked = TRUE
        )
    );

CREATE POLICY "Members can delete own signup"
    ON event_signups FOR DELETE
    TO authenticated
    USING (
        member_id = auth.uid()
        AND NOT EXISTS (
            SELECT 1 FROM events
            WHERE events.id = event_signups.event_id
            AND events.locked = TRUE
        )
    );
