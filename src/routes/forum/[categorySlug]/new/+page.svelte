<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import toast from 'svelte-french-toast';
  import { userProfile } from '$lib/stores/userProfile';
  import {
    loadCategoryBySlug,
    createTopic
  } from '$lib/stores/forumTopicsStore';
  import ForumNewTopicForm from '$lib/components/forum/ForumNewTopicForm.svelte';
  import { Hero, Container, LoadingSpinner, EmptyState, Button } from '$lib/components/ui';
  import { ArrowLeft } from 'lucide-svelte';

  $: categorySlug = $page.params.categorySlug;

  let category = null;
  let loading = true;
  let loadError = null;
  let submitting = false;

  $: canPost =
    category &&
    ((!category.officer_only && category.members_can_post) ||
      $userProfile?.is_officer);

  onMount(async () => {
    try {
      category = await loadCategoryBySlug(categorySlug);
    } catch (err) {
      loadError = err.message || 'Could not load category';
    } finally {
      loading = false;
    }
  });

  async function handleSubmit(e) {
    if (!$userProfile?.id) {
      toast.error('You must be signed in to post.');
      return;
    }
    if (!canPost) {
      toast.error('You do not have permission to post here.');
      return;
    }
    submitting = true;
    try {
      const topic = await createTopic({
        categoryId: category.id,
        authorId: $userProfile.id,
        title: e.detail.title,
        body: e.detail.body
      });
      toast.success('Topic posted!');
      goto(`/forum/${categorySlug}/${topic.slug}`);
    } catch (err) {
      console.error('Create topic failed:', err);
      toast.error(err.message || 'Failed to post topic.');
    } finally {
      submitting = false;
    }
  }

  function handleCancel() {
    goto(`/forum/${categorySlug}`);
  }
</script>

<svelte:head>
  <title>New Topic | JAX Members Portal</title>
</svelte:head>

<Hero
  title="Start a New Topic"
  subtitle={category?.name ? `In ${category.name}` : 'Forum'}
  backgroundImage="/Jax-Banner.png"
  overlay={true}
  compact={true}
/>

<Container size="md">
  <a href={`/forum/${categorySlug}`} class="forum-back-link">
    <ArrowLeft size={16} strokeWidth={2} />
    Back to {category?.name || 'category'}
  </a>

  {#if loading}
    <LoadingSpinner message="Loading…" />
  {:else if loadError}
    <EmptyState icon="⚠️" title="Could not load category" description={loadError}>
      <Button variant="primary" href="/forum">Back to forum</Button>
    </EmptyState>
  {:else if !canPost}
    <EmptyState
      icon="🔒"
      title="You can't post here"
      description="This category is restricted."
    >
      <Button variant="primary" href={`/forum/${categorySlug}`}>Back</Button>
    </EmptyState>
  {:else}
    <div class="forum-new-topic-wrap">
      <ForumNewTopicForm
        categoryName={category.name}
        {submitting}
        on:submit={handleSubmit}
        on:cancel={handleCancel}
      />
    </div>
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
  .forum-new-topic-wrap {
    background: var(--color-bg-card, #fff);
    border: 1px solid var(--color-border-secondary);
    border-radius: var(--radius-card);
    padding: var(--space-6);
    margin-bottom: var(--space-6);
  }
</style>
