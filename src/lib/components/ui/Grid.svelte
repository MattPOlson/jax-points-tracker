<script>
  /**
   * Grid Component
   *
   * A responsive grid layout component.
   *
   * @prop {number} cols - Number of columns on desktop (default: 3)
   * @prop {number} colsMd - Number of columns on tablet (default: 2)
   * @prop {number} colsSm - Number of columns on mobile (default: 1)
   * @prop {string} gap - Gap size: '1', '2', '3', '4', '6', '8', '10', '12'
   */

  export let cols = 3;
  export let colsMd = 2;
  export let colsSm = 1;
  export let gap = '6';
</script>

<div
  class="grid grid-gap-{gap}"
  style="
    --grid-cols: {cols};
    --grid-cols-md: {colsMd};
    --grid-cols-sm: {colsSm};
  "
>
  <slot />
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(var(--grid-cols), 1fr);
  }

  /* Gap sizes */
  .grid-gap-1 {
    gap: var(--space-1);
  }

  .grid-gap-2 {
    gap: var(--space-2);
  }

  .grid-gap-3 {
    gap: var(--space-3);
  }

  .grid-gap-4 {
    gap: var(--space-4);
  }

  .grid-gap-6 {
    gap: var(--space-6);
  }

  .grid-gap-8 {
    gap: var(--space-8);
  }

  .grid-gap-10 {
    gap: var(--space-10);
  }

  .grid-gap-12 {
    gap: var(--space-12);
  }

  /* Responsive breakpoints */
  @media (max-width: 768px) {
    .grid {
      grid-template-columns: repeat(var(--grid-cols-md), 1fr);
    }
  }

  @media (max-width: 640px) {
    .grid {
      grid-template-columns: repeat(var(--grid-cols-sm), 1fr);
    }
  }
</style>
