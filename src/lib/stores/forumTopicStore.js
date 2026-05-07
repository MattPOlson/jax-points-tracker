import { writable, get } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';

export const activeCategory = writable(null);
export const activeTopic = writable(null);
export const activePosts = writable([]);
export const isLoadingTopic = writable(false);
export const topicError = writable(null);

export function resetTopic() {
  activeCategory.set(null);
  activeTopic.set(null);
  activePosts.set([]);
  topicError.set(null);
}

export async function loadTopic(categorySlug, topicSlug) {
  isLoadingTopic.set(true);
  topicError.set(null);

  try {
    const { data: category, error: categoryError } = await supabase
      .from('forum_categories')
      .select('*')
      .eq('slug', categorySlug)
      .single();
    if (categoryError) throw categoryError;
    activeCategory.set(category);

    const { data: topic, error: topicErr } = await supabase
      .from('forum_topics')
      .select(
        `
        *,
        author:author_id ( id, name, role, is_officer )
      `
      )
      .eq('category_id', category.id)
      .eq('slug', topicSlug)
      .single();
    if (topicErr) throw topicErr;
    activeTopic.set(topic);

    const { data: posts, error: postsErr } = await supabase
      .from('forum_posts')
      .select(
        `
        *,
        author:author_id ( id, name, role, is_officer )
      `
      )
      .eq('topic_id', topic.id)
      .order('created_at', { ascending: true });
    if (postsErr) throw postsErr;
    activePosts.set(posts || []);

    return { category, topic, posts: posts || [] };
  } catch (err) {
    console.error('Failed to load topic:', err);
    topicError.set(err.message || 'Failed to load topic');
    activeTopic.set(null);
    activePosts.set([]);
    throw err;
  } finally {
    isLoadingTopic.set(false);
  }
}

export async function appendReply({ topicId, authorId, body }) {
  const { data, error } = await supabase
    .from('forum_posts')
    .insert({
      topic_id: topicId,
      author_id: authorId,
      body: body.trim(),
      is_first_post: false
    })
    .select(
      `
      *,
      author:author_id ( id, name, role, is_officer )
    `
    )
    .single();

  if (error) throw error;

  activePosts.update((posts) => [...posts, data]);

  activeTopic.update((t) =>
    t
      ? {
          ...t,
          reply_count: (t.reply_count || 0) + 1,
          last_reply_at: data.created_at,
          last_reply_author_id: data.author_id
        }
      : t
  );

  return data;
}

export async function editPostBody(postId, newBody) {
  const { data, error } = await supabase
    .from('forum_posts')
    .update({ body: newBody.trim() })
    .eq('id', postId)
    .select(
      `
      *,
      author:author_id ( id, name, role, is_officer )
    `
    )
    .single();
  if (error) throw error;

  activePosts.update((posts) => posts.map((p) => (p.id === postId ? data : p)));
  return data;
}

export async function softDeletePost(postId) {
  const { data, error } = await supabase
    .from('forum_posts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', postId)
    .select(
      `
      *,
      author:author_id ( id, name, role, is_officer )
    `
    )
    .single();
  if (error) throw error;

  activePosts.update((posts) => posts.map((p) => (p.id === postId ? data : p)));
  return data;
}

export async function setTopicPinned(topicId, pinned) {
  const { data, error } = await supabase
    .from('forum_topics')
    .update({ pinned })
    .eq('id', topicId)
    .select()
    .single();
  if (error) throw error;
  activeTopic.update((t) => (t && t.id === topicId ? { ...t, pinned: data.pinned } : t));
  return data;
}

export async function setTopicLocked(topicId, locked) {
  const { data, error } = await supabase
    .from('forum_topics')
    .update({ locked })
    .eq('id', topicId)
    .select()
    .single();
  if (error) throw error;
  activeTopic.update((t) => (t && t.id === topicId ? { ...t, locked: data.locked } : t));
  return data;
}

export async function deleteTopic(topicId) {
  const { error } = await supabase.from('forum_topics').delete().eq('id', topicId);
  if (error) throw error;
}
