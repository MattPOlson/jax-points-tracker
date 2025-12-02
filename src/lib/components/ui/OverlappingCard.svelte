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
    background: var(--color-bg-primary);
    padding: 3rem 2rem;
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    text-align: center;
    max-width: 700px;
    width: 100%;
    position: relative;
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .overlapping-card-container {
      margin-top: -4rem;
      margin-bottom: var(--space-3);
    }

    .overlapping-card {
      padding: 2rem 1rem;
    }
  }
</style>
