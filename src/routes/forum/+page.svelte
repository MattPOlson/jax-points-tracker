<script>
  import { onMount } from 'svelte';
  import {
    forumCategories,
    isLoadingCategories,
    categoriesError,
    loadForumCategories
  } from '$lib/stores/forumCategoriesStore';
  import ForumCategoryCard from '$lib/components/forum/ForumCategoryCard.svelte';
  import { Hero, Container, LoadingSpinner, EmptyState, Button } from '$lib/components/ui';

  onMount(() => {
    loadForumCategories(true);
  });
</script>

<svelte:head>
  <title>Forum | JAX Members Portal</title>
</svelte:head>

<Hero
  title="Club Forum"
  subtitle="Talk shop with fellow brewers — recipes, gear, comp prep, off-topic banter."
  backgroundImage="/Jax-Banner.png"
  overlay={true}
  compact={true}
/>

<Container size="lg">
  {#if $isLoadingCategories && $forumCategories.length === 0}
    <LoadingSpinner message="Loading forum…" />
  {:else if $categoriesError}
    <EmptyState
      icon="⚠️"
      title="Could not load forum"
      description={$categoriesError}
    >
      <Button variant="primary" on:click={() => loadForumCategories(true)}>Try Again</Button>
    </EmptyState>
  {:else if $forumCategories.length === 0}
    <EmptyState
      icon="💬"
      title="No categories yet"
      description="The forum hasn't been set up yet. Ask an officer."
    />
  {:else}
    <div class="forum-category-list">
      {#each $forumCategories as category (category.id)}
        <ForumCategoryCard {category} />
      {/each}
    </div>
  {/if}
</Container>

<style>
  .forum-category-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-top: var(--space-4);
  }
</style>
