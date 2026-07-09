<script>
  import { page } from '$app/stores';

  // 404 gets its own copy; everything else is treated as a transient failure
  // with a retry, so an unexpected error never shows a raw stack/500 (#118).
  $: status = $page.status;
  $: isNotFound = status === 404;

  function retry() {
    location.reload();
  }
</script>

<svelte:head>
  <title>{isNotFound ? 'Page not found' : 'Something went wrong'}</title>
</svelte:head>

<div class="error-page">
  <div class="error-card">
    <p class="error-status">{status}</p>
    <h1 class="error-title">
      {isNotFound ? 'Page not found' : 'Something went wrong'}
    </h1>
    <p class="error-message">
      {#if isNotFound}
        We couldn't find the page you were looking for.
      {:else}
        This is usually temporary. Please try again in a moment.
      {/if}
    </p>
    <div class="error-actions">
      {#if !isNotFound}
        <button type="button" class="btn-primary" on:click={retry}>Try again</button>
      {/if}
      <a class="btn-secondary" href="/">Go to home</a>
    </div>
  </div>
</div>

<style>
  .error-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 70vh;
    padding: var(--space-6);
  }

  .error-card {
    width: 100%;
    max-width: 28rem;
    text-align: center;
    background: var(--color-bg-card);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    padding: var(--space-10) var(--space-8);
  }

  .error-status {
    font-family: var(--font-family-display);
    font-size: var(--font-size-5xl);
    line-height: 1;
    color: var(--color-brand-primary);
    margin: 0;
  }

  .error-title {
    font-family: var(--font-family-display);
    font-size: var(--font-size-2xl);
    color: var(--color-text-primary);
    margin: var(--space-4) 0 var(--space-2);
  }

  .error-message {
    font-family: var(--font-family-base);
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    margin: 0 0 var(--space-8);
  }

  .error-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    justify-content: center;
  }

  .btn-primary,
  .btn-secondary {
    font-family: var(--font-family-base);
    font-size: var(--font-size-base);
    padding: var(--space-3) var(--space-6);
    border-radius: var(--radius-button);
    cursor: pointer;
    text-decoration: none;
    border: 1px solid transparent;
  }

  .btn-primary {
    background: var(--color-brand-primary);
    color: var(--color-text-inverse);
  }

  .btn-primary:hover {
    background: var(--color-brand-primary-hover);
  }

  .btn-secondary {
    background: transparent;
    color: var(--color-text-primary);
    border-color: var(--color-border-primary);
  }

  .btn-secondary:hover {
    background: var(--color-bg-secondary);
  }
</style>
