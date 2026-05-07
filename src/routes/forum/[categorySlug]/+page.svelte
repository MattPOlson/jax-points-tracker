<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import {
    currentCategory,
    currentTopics,
    currentPage,
    totalTopics,
    isLoadingTopics,
    topicsError,
    loadTopicsForCategory,
    PAGE_SIZE
  } from '$lib/stores/forumTopicsStore';
  import { userProfile } from '$lib/stores/userProfile';
  import ForumTopicRow from '$lib/components/forum/ForumTopicRow.svelte';
  import { Hero, Container, LoadingSpinner, EmptyState, Button } from '$lib/components/ui';
  import { ChevronLeft, ChevronRight, Plus, ArrowLeft } from 'lucide-svelte';

  $: categorySlug = $page.params.categorySlug;

  let lastLoadedKey = '';

  $: pageNum = parseInt($page.url.searchParams.get('page') || '1', 10) || 1;

  $: loadKey = `${categorySlug}|${pageNum}`;
  $: if (categorySlug && loadKey !== lastLoadedKey) {
    lastLoadedKey = loadKey;
    loadTopicsForCategory(categorySlug, pageNum).catch(() => {});
  }

  $: totalPages = Math.max(1, Math.ceil(($totalTopics || 0) / PAGE_SIZE));
  $: canPost =
    $currentCategory &&
    !$currentCategory.officer_only &&
    ($currentCategory.members_can_post || $userProfile?.is_officer);
  $: officerOnly = $currentCategory?.officer_only && $userProfile?.is_officer;
  $: canPostHere = canPost || officerOnly;

  function goToPage(p) {
    const url = new URL($page.url);
    if (p === 1) url.searchParams.delete('page');
    else url.searchParams.set('page', String(p));
    goto(url.pathname + url.search);
  }
</script>

<svelte:head>
  <title>{$currentCategory?.name || 'Forum'} | JAX Members Portal</title>
</svelte:head>

<Hero
  title={$currentCategory?.name || 'Forum'}
  subtitle={$currentCategory?.description || ''}
  backgroundImage="/Jax-Banner.png"
  overlay={true}
  compact={true}
/>

<Container size="lg">
  <div class="forum-toolbar">
    <a href="/forum" class="forum-back-link">
      <ArrowLeft size={16} strokeWidth={2} />
      All categories
    </a>
    {#if canPostHere}
      <Button variant="primary" on:click={() => goto(`/forum/${categorySlug}/new`)}>
        <Plus size={16} strokeWidth={2} />
        New Topic
      </Button>
    {/if}
  </div>

  {#if $isLoadingTopics && $currentTopics.length === 0}
    <LoadingSpinner message="Loading topics…" />
  {:else if $topicsError}
    <EmptyState icon="⚠️" title="Could not load topics" description={$topicsError}>
      <Button variant="primary" on:click={() => loadTopicsForCategory(categorySlug, pageNum)}>
        Try Again
      </Button>
    </EmptyState>
  {:else if $currentTopics.length === 0}
    <EmptyState
      icon="💬"
      title="No topics yet"
      description={canPostHere ? 'Be the first to start one.' : 'Check back later.'}
    >
      {#if canPostHere}
        <Button variant="primary" on:click={() => goto(`/forum/${categorySlug}/new`)}>
          <Plus size={16} strokeWidth={2} />
          New Topic
        </Button>
      {/if}
    </EmptyState>
  {:else}
    <div class="forum-topic-list">
      {#each $currentTopics as topic (topic.id)}
        <ForumTopicRow {topic} {categorySlug} />
      {/each}
    </div>

    {#if totalPages > 1}
      <div class="forum-pagination">
        <Button variant="secondary" disabled={pageNum <= 1} on:click={() => goToPage(pageNum - 1)}>
          <ChevronLeft size={16} strokeWidth={2} />
          Previous
        </Button>
        <span class="forum-pagination-info">Page {pageNum} of {totalPages}</span>
        <Button
          variant="secondary"
          disabled={pageNum >= totalPages}
          on:click={() => goToPage(pageNum + 1)}
        >
          Next
          <ChevronRight size={16} strokeWidth={2} />
        </Button>
      </div>
    {/if}
  {/if}
</Container>

<style>
  .forum-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: var(--space-4) 0;
    gap: var(--space-3);
  }

  .forum-back-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    color: var(--color-text-secondary);
    text-decoration: none;
    font-size: var(--font-size-sm);
  }
  .forum-back-link:hover {
    color: var(--color-brand-primary);
  }

  .forum-topic-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .forum-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    margin: var(--space-6) 0 var(--space-4) 0;
  }

  .forum-pagination-info {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }
</style>
