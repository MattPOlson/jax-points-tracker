<script>
  /**
   * Hero Component
   *
   * A page header component with title, subtitle, and optional icon.
   *
   * @prop {string} title - Main heading text
   * @prop {string} subtitle - Optional subtitle text
   * @prop {string} icon - Optional icon/emoji to display before title
   * @prop {boolean} center - Center align content (default: false)
   */

  export let title;
  export let subtitle = '';
  export let icon = '';
  export let center = false;
</script>

<div class="hero" class:hero-center={center}>
  <h1>
    {#if icon}
      <span class="hero-icon">{icon}</span>
    {/if}
    {title}
  </h1>
  {#if subtitle}
    <p class="hero-subtitle">{subtitle}</p>
  {/if}
</div>

<style>
  .hero {
    margin-bottom: var(--space-12);
  }

  .hero-center {
    text-align: center;
  }

  .hero h1 {
    color: var(--color-brand-primary);
    text-transform: uppercase;
    font-size: var(--font-size-5xl);
    font-weight: var(--font-weight-light);
    margin: 0 0 var(--space-4) 0;
    line-height: var(--line-height-tight);
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .hero-center h1 {
    justify-content: center;
  }

  .hero-icon {
    font-size: var(--font-size-6xl);
  }

  .hero-subtitle {
    font-size: var(--font-size-xl);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
    margin: 0;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .hero h1 {
      font-size: var(--font-size-3xl);
    }

    .hero-icon {
      font-size: var(--font-size-4xl);
    }

    .hero-subtitle {
      font-size: var(--font-size-base);
    }
  }

  @media (max-width: 480px) {
    .hero h1 {
      font-size: var(--font-size-2xl);
      flex-direction: column;
      gap: var(--space-2);
    }

    .hero-icon {
      font-size: var(--font-size-3xl);
    }

    .hero-subtitle {
      font-size: var(--font-size-sm);
    }
  }
</style>
