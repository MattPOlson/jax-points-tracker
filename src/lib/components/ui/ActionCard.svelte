<script>
  /**
   * ActionCard Component
   *
   * Grid-based action cards with large icons for navigation.
   *
   * @prop {string} title - Card title
   * @prop {string} description - Card description
   * @prop {string} href - Link destination (optional)
   */

  export let title;
  export let description;
  export let href = '';
</script>

{#if href}
  <a {href} class="action-card">
    <div class="card-icon">
      <slot name="icon" />
    </div>
    <h4 class="card-title">{title}</h4>
    <p class="card-description">{description}</p>
    <slot />
  </a>
{:else}
  <div class="action-card">
    <div class="card-icon">
      <slot name="icon" />
    </div>
    <h4 class="card-title">{title}</h4>
    <p class="card-description">{description}</p>
    <slot />
  </div>
{/if}

<style>
  .action-card {
    background: var(--color-bg-primary);
    padding: 2.5rem 1.5rem;
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: all var(--transition-base);
    text-decoration: none;
    color: inherit;
  }

  .action-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
  }

  .card-icon {
    width: 64px;
    height: 64px;
    margin-bottom: var(--space-6);
    color: var(--color-brand-primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-icon :global(svg) {
    width: 64px;
    height: 64px;
    stroke-width: 1.5;
  }

  .card-title {
    font-size: 1.25rem;
    font-weight: var(--font-weight-bold);
    color: var(--color-brand-primary);
    margin-bottom: var(--space-3);
    margin-top: 0;
  }

  .card-description {
    color: var(--color-text-secondary);
    font-size: 1rem;
    margin: 0;
    text-align: center;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .action-card {
      padding: 2rem 1rem;
    }

    .card-icon {
      width: 48px;
      height: 48px;
      margin-bottom: var(--space-4);
    }

    .card-icon :global(svg) {
      width: 48px;
      height: 48px;
    }

    .card-title {
      font-size: 1.125rem;
    }

    .card-description {
      font-size: 0.875rem;
    }
  }
</style>
