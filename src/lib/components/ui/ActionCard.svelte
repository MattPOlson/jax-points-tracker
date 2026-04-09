<script>
  /**
   * ActionCard Component
   *
   * Grid-based action cards with large icons for navigation.
   *
   * @prop {string} title - Card title
   * @prop {string} description - Card description
   * @prop {string} href - Link destination (optional)
   * @prop {boolean} featured - Featured/primary card, spans wider with horizontal layout
   */

  export let title;
  export let description;
  export let href = '';
  export let featured = false;
</script>

{#if href}
  <a {href} class="action-card" class:featured>
    <div class="card-icon">
      <slot name="icon" />
    </div>
    <div class="card-body">
      <h4 class="card-title">{title}</h4>
      <p class="card-description">{description}</p>
      <slot />
    </div>
  </a>
{:else}
  <div class="action-card" class:featured>
    <div class="card-icon">
      <slot name="icon" />
    </div>
    <div class="card-body">
      <h4 class="card-title">{title}</h4>
      <p class="card-description">{description}</p>
      <slot />
    </div>
  </div>
{/if}

<style>
  .action-card {
    background: var(--color-bg-card, #ffffff);
    padding: 2.5rem 1.5rem;
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: transform var(--transition-slow), box-shadow var(--transition-slow), border-color var(--transition-slow);
    text-decoration: none;
    color: inherit;
    border-top: 3px solid transparent;
    position: relative;
    overflow: hidden;
  }

  /* Sweep highlight on hover */
  .action-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 60%;
    height: 100%;
    background: linear-gradient(
      105deg,
      transparent 0%,
      rgba(201, 162, 39, 0.06) 50%,
      transparent 100%
    );
    transition: left 0.5s ease;
    pointer-events: none;
  }

  .action-card:hover::before {
    left: 160%;
  }

  .action-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(26, 42, 68, 0.14);
    border-top-color: var(--color-brand-gold);
  }

  /* Featured card — wider, horizontal layout */
  .action-card.featured {
    grid-column: span 2;
    flex-direction: row;
    text-align: left;
    align-items: flex-start;
    padding: 2.5rem 2rem;
    gap: 1.75rem;
    border-top: 3px solid var(--color-brand-gold-light, rgba(201, 162, 39, 0.3));
    background: linear-gradient(
      135deg,
      #ffffff 0%,
      rgba(201, 162, 39, 0.04) 100%
    );
  }

  .action-card.featured:hover {
    border-top-color: var(--color-brand-gold);
    box-shadow: 0 20px 50px rgba(26, 42, 68, 0.16), 0 0 0 1px rgba(201, 162, 39, 0.15);
  }

  .card-body {
    display: flex;
    flex-direction: column;
    align-items: inherit;
  }

  .featured .card-body {
    align-items: flex-start;
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

  .featured .card-icon {
    margin-bottom: 0;
    width: 80px;
    height: 80px;
    background: var(--color-brand-gold-light, rgba(201, 162, 39, 0.12));
    color: var(--color-brand-gold);
  }

  .action-card:not(.featured):hover .card-icon {
    background: var(--color-brand-primary);
    color: white;
    transform: scale(1.05);
  }

  .action-card.featured:hover .card-icon {
    background: var(--color-brand-gold);
    color: white;
    transform: scale(1.05);
  }

  .card-icon :global(svg) {
    width: 36px;
    height: 36px;
    stroke-width: 1.5;
  }

  .featured .card-icon :global(svg) {
    width: 40px;
    height: 40px;
  }

  .card-title {
    font-family: var(--font-family-display);
    font-size: 1.15rem;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--color-brand-primary);
    margin-bottom: var(--space-2);
    margin-top: 0;
  }

  .featured .card-title {
    font-size: 1.35rem;
    letter-spacing: 1.5px;
  }

  .card-description {
    color: var(--color-text-secondary);
    font-size: 1rem;
    margin: 0;
    text-align: center;
  }

  .featured .card-description {
    text-align: left;
    font-size: 1rem;
    line-height: 1.6;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .action-card.featured {
      grid-column: span 1;
      flex-direction: column;
      text-align: center;
      align-items: center;
    }

    .featured .card-icon {
      margin-bottom: var(--space-4);
    }

    .featured .card-body {
      align-items: center;
    }

    .featured .card-description {
      text-align: center;
    }
  }

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
      font-size: 1rem;
    }

    .card-description {
      font-size: 0.875rem;
    }
  }
</style>
