<script>
  /**
   * LoadingSpinner Component
   *
   * A loading spinner with optional message.
   *
   * @prop {string} message - Optional loading message to display
   * @prop {string} size - Spinner size: 'sm', 'md', 'lg'
   * @prop {boolean} center - Center the spinner (default: true)
   */

  export let message = 'Loading...';
  export let size = 'md';
  export let center = true;
</script>

<div class="loading" class:loading-center={center}>
  <div class="spinner spinner-{size}"></div>
  {#if message}
    <p class="loading-message">{message}</p>
  {/if}
</div>

<style>
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-12);
  }

  .loading-center {
    justify-content: center;
    min-height: 200px;
  }

  .spinner {
    border-radius: var(--radius-full);
    border-style: solid;
    border-color: var(--color-brand-primary-light);
    border-top-color: var(--color-brand-primary);
    animation: spin 1s linear infinite;
  }

  .spinner-sm {
    width: 24px;
    height: 24px;
    border-width: 2px;
  }

  .spinner-md {
    width: 40px;
    height: 40px;
    border-width: 4px;
  }

  .spinner-lg {
    width: 64px;
    height: 64px;
    border-width: 6px;
  }

  .loading-message {
    color: var(--color-text-secondary);
    font-size: var(--font-size-base);
    margin: 0;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
