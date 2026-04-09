<script>
  /**
   * OverlappingCard Component
   *
   * A card component that overlaps hero sections with negative margin.
   * Used for CTA cards that sit partially over hero backgrounds.
   */
</script>

<div class="overlapping-card-container">
  <div class="overlapping-card">
    <slot />
  </div>
</div>

<style>
  .overlapping-card-container {
    display: flex;
    justify-content: center;
    margin-top: -6rem;
    padding: 0 var(--space-4);
    margin-bottom: var(--space-4);
    position: relative;
    z-index: 10;
  }

  .overlapping-card {
    background: var(--color-bg-card, #ffffff);
    padding: 3rem 2rem;
    border-radius: var(--radius-card);
    box-shadow: 0 8px 40px rgba(26, 42, 68, 0.16);
    text-align: center;
    max-width: 700px;
    width: 100%;
    position: relative;
    border-top: 4px solid var(--color-brand-gold);
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .overlapping-card-container {
      margin-top: -3rem;
      margin-bottom: var(--space-2);
    }

    .overlapping-card {
      padding: 1.5rem 1rem;
    }
  }
</style>
