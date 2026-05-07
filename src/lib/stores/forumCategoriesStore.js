import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';

export const forumCategories = writable([]);
export const isLoadingCategories = writable(false);
export const categoriesError = writable(null);

let lastLoaded = 0;
const CACHE_MS = 30000;

export function resetForumCategories() {
  forumCategories.set([]);
  categoriesError.set(null);
  lastLoaded = 0;
}

export async function loadForumCategories(force = false) {
  if (!force && Date.now() - lastLoaded < CACHE_MS) return;

  isLoadingCategories.set(true);
  categoriesError.set(null);

  try {
    const { data: categories, error } = await supabase
      .from('forum_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    const categoryIds = (categories || []).map((c) => c.id);
    let activity = new Map();

    if (categoryIds.length) {
      const { data: topics, error: topicsError } = await supabase
        .from('forum_topics')
        .select('category_id, title, slug, last_reply_at, created_at, reply_count')
        .in('category_id', categoryIds)
        .order('last_reply_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (topicsError) throw topicsError;

      for (const t of topics || []) {
        if (!activity.has(t.category_id)) {
          activity.set(t.category_id, {
            lastTopicTitle: t.title,
            lastTopicSlug: t.slug,
            lastActivityAt: t.last_reply_at || t.created_at
          });
        }
      }

      const counts = new Map();
      for (const t of topics || []) {
        counts.set(t.category_id, (counts.get(t.category_id) || 0) + 1);
      }
      for (const [id, count] of counts) {
        const entry = activity.get(id) || {};
        entry.topicCount = count;
        activity.set(id, entry);
      }
    }

    const enriched = (categories || []).map((c) => ({
      ...c,
      ...(activity.get(c.id) || { topicCount: 0, lastTopicTitle: null, lastTopicSlug: null, lastActivityAt: null })
    }));

    forumCategories.set(enriched);
    lastLoaded = Date.now();
  } catch (err) {
    console.error('Failed to load forum categories:', err);
    categoriesError.set(err.message || 'Failed to load forum');
    forumCategories.set([]);
  } finally {
    isLoadingCategories.set(false);
  }
}
