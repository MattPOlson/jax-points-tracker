<script>
  /**
   * Stack Component
   *
   * A layout component for vertical spacing between children.
   *
   * @prop {string} gap - Gap size: '1', '2', '3', '4', '6', '8', '10', '12', '16'
   * @prop {string} align - Horizontal alignment: 'start', 'center', 'end', 'stretch'
   */

  export let gap = '4';
  export let align = 'stretch';
</script>

<div class="stack stack-gap-{gap} stack-align-{align}">
  <slot />
</div>

<style>
  .stack {
    display: flex;
    flex-direction: column;
  }

  /* Gap sizes */
  .stack-gap-1 {
    gap: var(--space-1);
  }

  .stack-gap-2 {
    gap: var(--space-2);
  }

  .stack-gap-3 {
    gap: var(--space-3);
  }

  .stack-gap-4 {
    gap: var(--space-4);
  }

  .stack-gap-6 {
    gap: var(--space-6);
  }

  .stack-gap-8 {
    gap: var(--space-8);
  }

  .stack-gap-10 {
    gap: var(--space-10);
  }

  .stack-gap-12 {
    gap: var(--space-12);
  }

  .stack-gap-16 {
    gap: var(--space-16);
  }

  /* Alignment */
  .stack-align-start {
    align-items: flex-start;
  }

  .stack-align-center {
    align-items: center;
  }

  .stack-align-end {
    align-items: flex-end;
  }

  .stack-align-stretch {
    align-items: stretch;
  }
</style>
