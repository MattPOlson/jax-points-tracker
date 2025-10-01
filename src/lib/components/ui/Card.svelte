<script>
  /**
   * Card Component
   *
   * A container component with consistent styling for content cards.
   *
   * @prop {boolean} accent - Whether to show left accent border
   * @prop {string} accentColor - Color for accent border: 'primary', 'success', 'warning', 'danger', 'info'
   * @prop {boolean} noPadding - Remove default padding
   * @prop {boolean} hover - Add hover effect
   */

  export let accent = false;
  export let accentColor = 'primary';
  export let noPadding = false;
  export let hover = false;
</script>

<div
  class="card"
  class:card-accent={accent}
  class:card-accent-primary={accent && accentColor === 'primary'}
  class:card-accent-success={accent && accentColor === 'success'}
  class:card-accent-warning={accent && accentColor === 'warning'}
  class:card-accent-danger={accent && accentColor === 'danger'}
  class:card-accent-info={accent && accentColor === 'info'}
  class:card-no-padding={noPadding}
  class:card-hover={hover}
  on:click
>
  <slot />
</div>

<style>
  .card {
    background-color: var(--color-bg-primary);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    padding: var(--space-6);
    transition: all var(--transition-base);
  }

  .card-no-padding {
    padding: 0;
  }

  .card-hover {
    cursor: pointer;
  }

  .card-hover:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  /* Accent border */
  .card-accent {
    border-left: 4px solid;
  }

  .card-accent-primary {
    border-left-color: var(--color-brand-primary);
  }

  .card-accent-success {
    border-left-color: var(--color-success);
  }

  .card-accent-warning {
    border-left-color: var(--color-warning);
  }

  .card-accent-danger {
    border-left-color: var(--color-danger);
  }

  .card-accent-info {
    border-left-color: var(--color-info);
  }
</style>
