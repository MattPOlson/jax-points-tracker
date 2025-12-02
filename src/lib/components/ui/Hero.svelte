<script>
  /**
   * Hero Component
   *
   * A page header component with title, subtitle, and optional icon.
   * Supports background images for major landing pages.
   *
   * @prop {string} title - Main heading text
   * @prop {string} subtitle - Optional subtitle text
   * @prop {string} icon - Optional icon/emoji to display before title
   * @prop {boolean} center - Center align content (default: false)
   * @prop {string} backgroundImage - Optional background image URL
   * @prop {boolean} overlay - Show dark overlay on image (default: true)
   * @prop {boolean} large - Large hero for landing pages (default: false)
   * @prop {boolean} compact - Compact hero for subpages (default: false)
   */

  export let title;
  export let subtitle = '';
  export let icon = '';
  export let center = false;
  export let backgroundImage = '';
  export let overlay = true;
  export let large = false;
  export let compact = false;
</script>

{#if backgroundImage}
  <section class="hero hero-with-image" class:hero-large={large} class:hero-compact={compact}>
    <div class="hero-background" style="background-image: url({backgroundImage})"></div>
    {#if overlay}
      <div class="hero-overlay"></div>
    {/if}
    <div class="hero-content">
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
  </section>
{:else}
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
{/if}

<style>
  /* Simple Hero (no background image) */
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
    font-weight: var(--font-weight-bold);
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

  /* Hero with Background Image */
  .hero-with-image {
    position: relative;
    background-size: cover;
    background-position: center;
    text-align: center;
    color: var(--color-white);
    padding: 4rem 1rem;
    margin-bottom: 0;
  }

  .hero-large {
    padding: 4rem 1rem 8rem 1rem;
  }

  .hero-compact {
    padding: 2.5rem 1rem 4rem 1rem;
  }

  .hero-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    z-index: 0;
  }

  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(rgba(26, 42, 68, 0.7), rgba(26, 42, 68, 0.7));
    z-index: 1;
  }

  .hero-content {
    position: relative;
    z-index: 2;
  }

  .hero-with-image h1 {
    color: var(--color-white);
    font-size: var(--font-size-5xl);
    font-weight: var(--font-weight-bold);
    margin: 0;
    display: block;
  }

  .hero-with-image .hero-subtitle {
    color: var(--color-white);
    font-size: var(--font-size-xl);
    margin-top: var(--space-4);
  }

  .hero-with-image .hero-icon {
    display: block;
    margin-bottom: var(--space-4);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .hero h1,
    .hero-with-image h1 {
      font-size: var(--font-size-3xl);
    }

    .hero-icon {
      font-size: var(--font-size-4xl);
    }

    .hero-subtitle,
    .hero-with-image .hero-subtitle {
      font-size: var(--font-size-base);
    }

    .hero-with-image {
      padding: 3rem 1rem;
    }

    .hero-large {
      padding: 3rem 1rem 6rem 1rem;
    }

    .hero-compact {
      padding: 2rem 1rem 3rem 1rem;
    }
  }

  @media (max-width: 480px) {
    .hero h1 {
      font-size: var(--font-size-2xl);
      flex-direction: column;
      gap: var(--space-2);
    }

    .hero-with-image h1 {
      font-size: var(--font-size-2xl);
    }

    .hero-icon {
      font-size: var(--font-size-3xl);
    }

    .hero-subtitle,
    .hero-with-image .hero-subtitle {
      font-size: var(--font-size-sm);
    }

    .hero-with-image {
      padding: 2rem 1rem;
    }

    .hero-large {
      padding: 2rem 1rem 4rem 1rem;
    }

    .hero-compact {
      padding: 1.5rem 1rem 2.5rem 1rem;
    }
  }
</style>
