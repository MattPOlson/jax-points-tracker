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
    transition: all var(--transition-slow);
    text-decoration: none;
    color: inherit;
    border-top: 3px solid transparent;
    position: relative;
    overflow: hidden;
  }

  .action-card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: var(--radius-card);
    opacity: 0;
    transition: opacity var(--transition-slow);
    background: linear-gradient(135deg, rgba(26, 42, 68, 0.03) 0%, transparent 60%);
  }

  .action-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(26, 42, 68, 0.18);
    border-top-color: var(--color-brand-primary);
  }

  .action-card:hover::after {
    opacity: 1;
  }

  .card-icon {
    width: 72px;
    height: 72px;
    margin-bottom: var(--space-6);
    color: var(--color-brand-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-brand-primary-light);
    border-radius: var(--radius-xl);
    transition: all var(--transition-slow);
    flex-shrink: 0;
  }

  .action-card:hover .card-icon {
    background: var(--color-brand-primary);
    color: white;
    transform: scale(1.05);
  }

  .card-icon :global(svg) {
    width: 36px;
    height: 36px;
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
      width: 60px;
      height: 60px;
      margin-bottom: var(--space-4);
    }

    .card-icon :global(svg) {
      width: 30px;
      height: 30px;
    }

    .card-title {
      font-size: 1.125rem;
    }

    .card-description {
      font-size: 0.875rem;
    }
  }
</style>
