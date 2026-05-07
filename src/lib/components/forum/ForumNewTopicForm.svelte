<script>
  import { createEventDispatcher } from 'svelte';
  import { FormInput, Button } from '$lib/components/ui';
  import ForumEditor from './ForumEditor.svelte';

  export let submitting = false;
  export let categoryName = '';

  let title = '';
  let body = '';
  let titleError = '';
  let bodyError = '';

  const dispatch = createEventDispatcher();

  function validate() {
    titleError = '';
    bodyError = '';
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (trimmedTitle.length < 3) titleError = 'Title must be at least 3 characters.';
    else if (trimmedTitle.length > 200) titleError = 'Title must be 200 characters or fewer.';
    if (trimmedBody.length < 1) bodyError = 'Post body cannot be empty.';
    else if (trimmedBody.length > 20000) bodyError = 'Post body is too long.';
    return !titleError && !bodyError;
  }

  function onSubmit() {
    if (!validate()) return;
    dispatch('submit', { title: title.trim(), body: body.trim() });
  }

  function onCancel() {
    dispatch('cancel');
  }
</script>

<form class="forum-new-topic-form" on:submit|preventDefault={onSubmit}>
  <FormInput
    id="topic-title"
    label="Topic title"
    bind:value={title}
    placeholder={`Topic in ${categoryName || 'this category'}…`}
    disabled={submitting}
    error={titleError}
    required
  />

  <ForumEditor
    id="topic-body"
    label="Post"
    bind:value={body}
    rows={12}
    disabled={submitting}
  />
  {#if bodyError}
    <p class="forum-form-error">{bodyError}</p>
  {/if}

  <div class="forum-new-topic-actions">
    <Button type="submit" variant="primary" disabled={submitting}>
      {submitting ? 'Posting…' : 'Post topic'}
    </Button>
    <Button type="button" variant="secondary" on:click={onCancel} disabled={submitting}>
      Cancel
    </Button>
  </div>
</form>

<style>
  .forum-new-topic-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
  .forum-new-topic-actions {
    display: flex;
    gap: var(--space-3);
    margin-top: var(--space-2);
  }
  .forum-form-error {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-danger);
  }
</style>
