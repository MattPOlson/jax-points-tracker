-- Forum Schema Migration
-- Adds an in-app forum: categories, topics, replies.
-- Reuses members.id (= auth.uid()) and the existing is_officer flag.
-- Run in the Supabase SQL editor.

-- =============================================
-- 1. forum_categories
-- =============================================
CREATE TABLE IF NOT EXISTS forum_categories (
    id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name             TEXT NOT NULL,
    slug             TEXT NOT NULL UNIQUE,
    description      TEXT,
    sort_order       INTEGER NOT NULL DEFAULT 0,
    officer_only     BOOLEAN NOT NULL DEFAULT FALSE,  -- members cannot see
    members_can_post BOOLEAN NOT NULL DEFAULT TRUE,   -- members cannot post (Announcements)
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forum_categories_sort
    ON forum_categories(sort_order, name);

-- =============================================
-- 2. forum_topics
-- =============================================
CREATE TABLE IF NOT EXISTS forum_topics (
    id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id          UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
    author_id            UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    title                TEXT NOT NULL CHECK (length(title) BETWEEN 3 AND 200),
    slug                 TEXT NOT NULL,
    pinned               BOOLEAN NOT NULL DEFAULT FALSE,
    locked               BOOLEAN NOT NULL DEFAULT FALSE,
    reply_count          INTEGER NOT NULL DEFAULT 0,
    last_reply_at        TIMESTAMPTZ,
    last_reply_author_id UUID REFERENCES members(id) ON DELETE SET NULL,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (category_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_forum_topics_list
    ON forum_topics (category_id, pinned DESC, COALESCE(last_reply_at, created_at) DESC);
CREATE INDEX IF NOT EXISTS idx_forum_topics_author
    ON forum_topics (author_id);

-- =============================================
-- 3. forum_posts (first post is the topic body; replies follow)
-- =============================================
CREATE TABLE IF NOT EXISTS forum_posts (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_id      UUID NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
    author_id     UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    body          TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 20000),
    is_first_post BOOLEAN NOT NULL DEFAULT FALSE,
    edited_at     TIMESTAMPTZ,
    edited_by_id  UUID REFERENCES members(id) ON DELETE SET NULL,
    deleted_at    TIMESTAMPTZ,
    deleted_by_id UUID REFERENCES members(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forum_posts_topic
    ON forum_posts (topic_id, created_at);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author
    ON forum_posts (author_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_forum_posts_first
    ON forum_posts (topic_id) WHERE is_first_post;

-- =============================================
-- 4. Triggers: maintain reply_count / last_reply_*, stamp edited_at
-- =============================================
CREATE OR REPLACE FUNCTION forum_posts_after_insert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_first_post THEN
        RETURN NEW;
    END IF;
    UPDATE forum_topics
       SET reply_count = reply_count + 1,
           last_reply_at = NEW.created_at,
           last_reply_author_id = NEW.author_id
     WHERE id = NEW.topic_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_forum_posts_after_insert
    AFTER INSERT ON forum_posts
    FOR EACH ROW
    EXECUTE FUNCTION forum_posts_after_insert();

CREATE OR REPLACE FUNCTION forum_posts_before_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.body IS DISTINCT FROM OLD.body THEN
        NEW.edited_at := NOW();
        NEW.edited_by_id := auth.uid();
    END IF;
    IF NEW.deleted_at IS DISTINCT FROM OLD.deleted_at AND NEW.deleted_at IS NOT NULL THEN
        NEW.deleted_by_id := auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_forum_posts_before_update
    BEFORE UPDATE ON forum_posts
    FOR EACH ROW
    EXECUTE FUNCTION forum_posts_before_update();

-- Restrict which fields non-officers can change on forum_topics.
-- Members may only edit `title`. Officers may change anything.
CREATE OR REPLACE FUNCTION forum_topics_restrict_member_updates()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM members
         WHERE members.id = auth.uid()
           AND members.is_officer = TRUE
    ) THEN
        RETURN NEW;
    END IF;
    IF NEW.category_id IS DISTINCT FROM OLD.category_id
       OR NEW.author_id IS DISTINCT FROM OLD.author_id
       OR NEW.pinned IS DISTINCT FROM OLD.pinned
       OR NEW.locked IS DISTINCT FROM OLD.locked
       OR NEW.slug IS DISTINCT FROM OLD.slug
       OR NEW.reply_count IS DISTINCT FROM OLD.reply_count
       OR NEW.last_reply_at IS DISTINCT FROM OLD.last_reply_at
       OR NEW.last_reply_author_id IS DISTINCT FROM OLD.last_reply_author_id THEN
        RAISE EXCEPTION 'Only officers can modify those fields on forum_topics';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_forum_topics_restrict_updates
    BEFORE UPDATE ON forum_topics
    FOR EACH ROW
    EXECUTE FUNCTION forum_topics_restrict_member_updates();

-- Restrict which fields non-officers can change on forum_posts.
CREATE OR REPLACE FUNCTION forum_posts_restrict_member_updates()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM members
         WHERE members.id = auth.uid()
           AND members.is_officer = TRUE
    ) THEN
        RETURN NEW;
    END IF;
    IF NEW.topic_id IS DISTINCT FROM OLD.topic_id
       OR NEW.author_id IS DISTINCT FROM OLD.author_id
       OR NEW.is_first_post IS DISTINCT FROM OLD.is_first_post
       OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at
       OR NEW.deleted_by_id IS DISTINCT FROM OLD.deleted_by_id THEN
        RAISE EXCEPTION 'Only officers can modify those fields on forum_posts';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_forum_posts_restrict_updates
    BEFORE UPDATE ON forum_posts
    FOR EACH ROW
    EXECUTE FUNCTION forum_posts_restrict_member_updates();

-- =============================================
-- 5. Row Level Security
-- =============================================
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics     ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts      ENABLE ROW LEVEL SECURITY;

-- ---------- forum_categories ----------
CREATE POLICY "Members can view non-officer categories"
    ON forum_categories FOR SELECT
    TO authenticated
    USING (
        officer_only = FALSE
        OR EXISTS (
            SELECT 1 FROM members
             WHERE members.id = auth.uid()
               AND members.is_officer = TRUE
        )
    );

CREATE POLICY "Officers can manage categories"
    ON forum_categories FOR ALL
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

-- ---------- forum_topics ----------
CREATE POLICY "Members can view topics in visible categories"
    ON forum_topics FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM forum_categories c
             WHERE c.id = forum_topics.category_id
               AND (
                   c.officer_only = FALSE
                   OR EXISTS (
                       SELECT 1 FROM members
                        WHERE members.id = auth.uid()
                          AND members.is_officer = TRUE
                   )
               )
        )
    );

-- Members may create topics in categories where members_can_post = TRUE
-- and the category is visible to them.
CREATE POLICY "Members can create topics"
    ON forum_topics FOR INSERT
    TO authenticated
    WITH CHECK (
        author_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM forum_categories c
             WHERE c.id = forum_topics.category_id
               AND c.officer_only = FALSE
               AND c.members_can_post = TRUE
        )
    );

-- Officers can create topics in any category.
CREATE POLICY "Officers can create topics anywhere"
    ON forum_topics FOR INSERT
    TO authenticated
    WITH CHECK (
        author_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM members
             WHERE members.id = auth.uid()
               AND members.is_officer = TRUE
        )
    );

-- Authors can update their own topic title within 15 min.
-- Trigger above restricts which fields can change.
CREATE POLICY "Authors can edit own topics within window"
    ON forum_topics FOR UPDATE
    TO authenticated
    USING (
        author_id = auth.uid()
        AND NOW() - created_at < INTERVAL '15 minutes'
    )
    WITH CHECK (author_id = auth.uid());

CREATE POLICY "Officers can edit any topic"
    ON forum_topics FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM members
             WHERE members.id = auth.uid()
               AND members.is_officer = TRUE
        )
    )
    WITH CHECK (TRUE);

CREATE POLICY "Officers can delete topics"
    ON forum_topics FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM members
             WHERE members.id = auth.uid()
               AND members.is_officer = TRUE
        )
    );

-- ---------- forum_posts ----------
CREATE POLICY "Members can view posts in visible topics"
    ON forum_posts FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM forum_topics t
            JOIN forum_categories c ON c.id = t.category_id
             WHERE t.id = forum_posts.topic_id
               AND (
                   c.officer_only = FALSE
                   OR EXISTS (
                       SELECT 1 FROM members
                        WHERE members.id = auth.uid()
                          AND members.is_officer = TRUE
                   )
               )
        )
        AND (
            deleted_at IS NULL
            OR EXISTS (
                SELECT 1 FROM members
                 WHERE members.id = auth.uid()
                   AND members.is_officer = TRUE
            )
        )
    );

-- Members may post in unlocked topics where the category allows posting.
CREATE POLICY "Members can create posts"
    ON forum_posts FOR INSERT
    TO authenticated
    WITH CHECK (
        author_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM forum_topics t
            JOIN forum_categories c ON c.id = t.category_id
             WHERE t.id = forum_posts.topic_id
               AND t.locked = FALSE
               AND c.officer_only = FALSE
               AND c.members_can_post = TRUE
        )
    );

CREATE POLICY "Officers can create posts anywhere"
    ON forum_posts FOR INSERT
    TO authenticated
    WITH CHECK (
        author_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM members
             WHERE members.id = auth.uid()
               AND members.is_officer = TRUE
        )
    );

-- Authors can edit own post body within 24 hours, while not deleted.
CREATE POLICY "Authors can edit own posts within window"
    ON forum_posts FOR UPDATE
    TO authenticated
    USING (
        author_id = auth.uid()
        AND deleted_at IS NULL
        AND NOW() - created_at < INTERVAL '24 hours'
    )
    WITH CHECK (author_id = auth.uid());

CREATE POLICY "Officers can edit any post"
    ON forum_posts FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM members
             WHERE members.id = auth.uid()
               AND members.is_officer = TRUE
        )
    )
    WITH CHECK (TRUE);

-- Hard DELETE on posts is forbidden via RLS (no policy granted).
-- Soft-delete is performed via UPDATE deleted_at.

-- =============================================
-- 6. Seed categories
-- =============================================
INSERT INTO forum_categories (name, slug, description, sort_order, officer_only, members_can_post) VALUES
    ('Announcements',                   'announcements',  'Official club announcements from officers.', 10, FALSE, FALSE),
    ('General Discussion',              'general',        'Anything brewing-related that does not fit elsewhere.', 20, FALSE, TRUE),
    ('Recipes & Brewing Techniques',    'recipes',        'Share recipes, ask for feedback, talk technique.',     30, FALSE, TRUE),
    ('Equipment & Gear',                'equipment',      'Kettles, fermenters, kegging, lab gear, anything you brew with.', 40, FALSE, TRUE),
    ('Competitions & Events',           'competitions',   'Comp prep, results, event chatter.',                   50, FALSE, TRUE),
    ('Ingredients (Hops, Malt, Yeast)', 'ingredients',    'Sourcing, swaps, reviews of specific ingredients.',    60, FALSE, TRUE),
    ('Off-Topic',                       'off-topic',      'Beer-adjacent or just life. Keep it civil.',           70, FALSE, TRUE),
    ('Officers',                        'officers',       'Private channel for officers.',                        80, TRUE,  TRUE)
ON CONFLICT (slug) DO NOTHING;
