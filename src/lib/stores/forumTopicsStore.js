import { writable, get } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import { slugify, withShortHash } from '$lib/utils/slug';

export const currentCategory = writable(null);
export const currentTopics = writable([]);
export const currentPage = writable(1);
export const totalTopics = writable(0);
export const isLoadingTopics = writable(false);
export const topicsError = writable(null);

export const PAGE_SIZE = 20;

export function resetTopics() {
  currentCategory.set(null);
  currentTopics.set([]);
  currentPage.set(1);
  totalTopics.set(0);
  topicsError.set(null);
}

export async function loadCategoryBySlug(slug) {
  const { data, error } = await supabase
    .from('forum_categories')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data;
}

export async function loadTopicsForCategory(categorySlug, page = 1) {
  isLoadingTopics.set(true);
  topicsError.set(null);

  try {
    const category = await loadCategoryBySlug(categorySlug);
    currentCategory.set(category);
    currentPage.set(page);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error, count } = await supabase
      .from('forum_topics')
      .select(
        `
        id, title, slug, pinned, locked, reply_count,
        last_reply_at, created_at,
        author:author_id ( id, name, role, is_officer ),
        last_reply_author:last_reply_author_id ( id, name )
      `,
        { count: 'exact' }
      )
      .eq('category_id', category.id)
      .order('pinned', { ascending: false })
      .order('last_reply_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    currentTopics.set(data || []);
    totalTopics.set(count || 0);
    return { category, topics: data || [], total: count || 0 };
  } catch (err) {
    console.error('Failed to load topics:', err);
    topicsError.set(err.message || 'Failed to load topics');
    currentTopics.set([]);
    totalTopics.set(0);
    throw err;
  } finally {
    isLoadingTopics.set(false);
  }
}

export async function createTopic({ categoryId, authorId, title, body }) {
  const baseSlug = slugify(title);
  const slug = withShortHash(baseSlug);

  const { data: topic, error: topicError } = await supabase
    .from('forum_topics')
    .insert({
      category_id: categoryId,
      author_id: authorId,
      title: title.trim(),
      slug
    })
    .select()
    .single();

  if (topicError) throw topicError;

  const { error: postError } = await supabase.from('forum_posts').insert({
    topic_id: topic.id,
    author_id: authorId,
    body: body.trim(),
    is_first_post: true
  });

  if (postError) {
    console.error('First post insert failed; topic was created without body:', postError);
    throw postError;
  }

  return topic;
}
