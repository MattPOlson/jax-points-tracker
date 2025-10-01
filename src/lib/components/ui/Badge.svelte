<script>
  /**
   * Badge Component
   *
   * A small status indicator or label.
   *
   * @prop {string} variant - Badge style: 'primary', 'secondary', 'success', 'warning', 'danger', 'info'
   * @prop {string} size - Badge size: 'sm', 'md', 'lg'
   */

  export let variant = 'primary';
  export let size = 'md';
</script>

<span class="badge badge-{variant} badge-{size}">
  <slot />
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: var(--font-weight-medium);
    border-radius: var(--radius-full);
    white-space: nowrap;
  }

  /* Sizes */
  .badge-sm {
    padding: var(--space-1) var(--space-2);
    font-size: var(--font-size-xs);
  }

  .badge-md {
    padding: var(--space-1) var(--space-3);
    font-size: var(--font-size-sm);
  }

  .badge-lg {
    padding: var(--space-2) var(--space-4);
    font-size: var(--font-size-base);
  }

  /* Variants */
  .badge-primary {
    background-color: var(--color-brand-primary-light);
    color: var(--color-brand-primary);
  }

  .badge-secondary {
    background-color: var(--color-gray-200);
    color: var(--color-gray-700);
  }

  .badge-success {
    background-color: var(--color-success-light);
    color: var(--color-success);
  }

  .badge-warning {
    background-color: var(--color-warning-light);
    color: var(--color-warning);
  }

  .badge-danger {
    background-color: var(--color-danger-light);
    color: var(--color-danger);
  }

  .badge-info {
    background-color: var(--color-info-light);
    color: var(--color-info);
  }
</style>
