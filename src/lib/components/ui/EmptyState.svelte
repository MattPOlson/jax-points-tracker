<script>
  /**
   * EmptyState Component
   *
   * A component to display when there's no data or content to show.
   *
   * @prop {string} icon - Icon/emoji to display
   * @prop {string} title - Main message
   * @prop {string} description - Optional description text
   */

  export let icon = '📭';
  export let title = 'No data available';
  export let description = '';
</script>

<div class="empty-state">
  <div class="empty-icon">{icon}</div>
  <h3 class="empty-title">{title}</h3>
  {#if description}
    <p class="empty-description">{description}</p>
  {/if}
  {#if $$slots.default}
    <div class="empty-actions">
      <slot />
    </div>
  {/if}
</div>

<style>
  .empty-state {
    background-color: var(--color-bg-primary);
    border-radius: var(--radius-md);
    padding: var(--space-12) var(--space-8);
    box-shadow: var(--shadow-md);
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
  }

  .empty-icon {
    font-size: var(--font-size-6xl);
    margin-bottom: var(--space-4);
  }

  .empty-title {
    color: var(--color-text-primary);
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    margin: 0 0 var(--space-4) 0;
  }

  .empty-description {
    color: var(--color-text-secondary);
    font-size: var(--font-size-base);
    margin: 0 0 var(--space-6) 0;
    line-height: var(--line-height-relaxed);
  }

  .empty-actions {
    display: flex;
    gap: var(--space-4);
    justify-content: center;
    margin-top: var(--space-6);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .empty-state {
      padding: var(--space-8) var(--space-6);
    }

    .empty-icon {
      font-size: var(--font-size-5xl);
    }

    .empty-title {
      font-size: var(--font-size-xl);
    }

    .empty-description {
      font-size: var(--font-size-sm);
    }
  }
</style>
