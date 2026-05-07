<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import toast from 'svelte-french-toast';
  import {
    activeCategory,
    activeTopic,
    activePosts,
    isLoadingTopic,
    topicError,
    loadTopic,
    appendReply
  } from '$lib/stores/forumTopicStore';
  import { userProfile } from '$lib/stores/userProfile';
  import ForumPost from '$lib/components/forum/ForumPost.svelte';
  import ForumEditor from '$lib/components/forum/ForumEditor.svelte';
  import { Hero, Container, LoadingSpinner, EmptyState, Button, Badge } from '$lib/components/ui';
  import { ArrowLeft, Lock, Pin, MessageSquare } from 'lucide-svelte';

  $: categorySlug = $page.params.categorySlug;
  $: topicSlug = $page.params.topicSlug;

  let lastLoadedKey = '';
  $: loadKey = `${categorySlug}|${topicSlug}`;
  $: if (categorySlug && topicSlug && loadKey !== lastLoadedKey) {
    lastLoadedKey = loadKey;
    loadTopic(categorySlug, topicSlug).catch(() => {});
  }

  let replyBody = '';
  let posting = false;

  $: canReply =
    $activeTopic &&
    !$activeTopic.locked &&
    $activeCategory &&
    !$activeCategory.officer_only &&
    ($activeCategory.members_can_post || $userProfile?.is_officer);
  $: canReplyAsOfficer = $userProfile?.is_officer && $activeTopic && !$activeTopic.locked;
  $: canPostReply = canReply || canReplyAsOfficer;

  async function submitReply() {
    if (!$userProfile?.id) {
      toast.error('You must be signed in to reply.');
      return;
    }
    const body = replyBody.trim();
    if (body.length < 1) {
      toast.error('Reply cannot be empty.');
      return;
    }
    if (body.length > 20000) {
      toast.error('Reply is too long.');
      return;
    }
    posting = true;
    try {
      await appendReply({
        topicId: $activeTopic.id,
        authorId: $userProfile.id,
        body
      });
      replyBody = '';
      toast.success('Reply posted.');
    } catch (err) {
      console.error('Reply failed:', err);
      toast.error(err.message || 'Failed to post reply.');
    } finally {
      posting = false;
    }
  }
</script>

<svelte:head>
  <title>{$activeTopic?.title || 'Topic'} | JAX Members Portal</title>
</svelte:head>

<Hero
  title={$activeTopic?.title || 'Loading…'}
  subtitle={$activeCategory?.name || ''}
  backgroundImage="/Jax-Banner.png"
  overlay={true}
  compact={true}
/>

<Container size="md">
  <a href={`/forum/${categorySlug}`} class="forum-back-link">
    <ArrowLeft size={16} strokeWidth={2} />
    Back to {$activeCategory?.name || 'category'}
  </a>

  {#if $isLoadingTopic && !$activeTopic}
    <LoadingSpinner message="Loading topic…" />
  {:else if $topicError}
    <EmptyState icon="⚠️" title="Could not load topic" description={$topicError}>
      <Button variant="primary" href={`/forum/${categorySlug}`}>Back to category</Button>
    </EmptyState>
  {:else if $activeTopic}
    <div class="forum-topic-status">
      {#if $activeTopic.pinned}
        <Badge variant="info"><Pin size={12} strokeWidth={2} /> Pinned</Badge>
      {/if}
      {#if $activeTopic.locked}
        <Badge variant="warning"><Lock size={12} strokeWidth={2} /> Locked</Badge>
      {/if}
      <span class="forum-topic-stat">
        <MessageSquare size={14} strokeWidth={2} />
        {$activeTopic.reply_count ?? 0} {$activeTopic.reply_count === 1 ? 'reply' : 'replies'}
      </span>
    </div>

    <div class="forum-post-list">
      {#each $activePosts as post (post.id)}
        <ForumPost {post} />
      {/each}
    </div>

    {#if $activeTopic.locked}
      <div class="forum-topic-locked-notice">
        <Lock size={16} strokeWidth={2} />
        This topic is locked. No new replies.
      </div>
    {:else if !$userProfile}
      <div class="forum-topic-locked-notice">
        Sign in to reply.
      </div>
    {:else if !canPostReply}
      <div class="forum-topic-locked-notice">
        You don't have permission to reply in this category.
      </div>
    {:else}
      <section class="forum-reply-box">
        <h3>Reply</h3>
        <ForumEditor
          id="reply-body"
          bind:value={replyBody}
          rows={6}
          disabled={posting}
        />
        <div class="forum-reply-actions">
          <Button variant="primary" disabled={posting} on:click={submitReply}>
            {posting ? 'Posting…' : 'Post reply'}
          </Button>
        </div>
      </section>
    {/if}
  {/if}
</Container>

<style>
  .forum-back-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    color: var(--color-text-secondary);
    text-decoration: none;
    font-size: var(--font-size-sm);
    margin: var(--space-4) 0;
  }
  .forum-back-link:hover {
    color: var(--color-brand-primary);
  }

  .forum-topic-status {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-3);
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }
  .forum-topic-stat {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
  }

  .forum-post-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-bottom: var(--space-6);
  }

  .forum-topic-locked-notice {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-4);
    background: var(--color-bg-secondary);
    border: 1px dashed var(--color-border-primary);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    margin-bottom: var(--space-6);
  }

  .forum-reply-box {
    background: var(--color-bg-card, #fff);
    border: 1px solid var(--color-border-secondary);
    border-radius: var(--radius-card);
    padding: var(--space-5);
    margin-bottom: var(--space-8);
  }
  .forum-reply-box h3 {
    margin: 0 0 var(--space-3) 0;
    color: var(--color-brand-primary);
  }
  .forum-reply-actions {
    margin-top: var(--space-3);
  }
</style>
