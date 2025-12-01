<script>
  /**
   * Button Component
   *
   * A flexible button component with multiple variants, sizes, and states.
   *
   * @prop {string} variant - Button style variant: 'primary', 'secondary', 'success', 'danger', 'info', 'ghost'
   * @prop {string} size - Button size: 'sm', 'md', 'lg'
   * @prop {boolean} disabled - Whether the button is disabled
   * @prop {boolean} fullWidth - Whether the button should take full width
   * @prop {string} type - Button type attribute: 'button', 'submit', 'reset'
   */

  export let variant = 'primary';
  export let size = 'md';
  export let disabled = false;
  export let fullWidth = false;
  export let type = 'button';
</script>

<button
  {type}
  class="btn btn-{variant} btn-{size}"
  class:btn-full-width={fullWidth}
  {disabled}
  on:click
>
  <slot />
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    border: none;
    border-radius: var(--radius-button);
    font-weight: var(--font-weight-semibold);
    text-align: center;
    cursor: pointer;
    transition: all var(--transition-base);
    white-space: nowrap;
    user-select: none;
  }

  .btn:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Sizes */
  .btn-sm {
    padding: var(--space-2) var(--space-4);
    font-size: var(--font-size-sm);
  }

  .btn-md {
    padding: var(--space-3) var(--space-6);
    font-size: var(--font-size-base);
  }

  .btn-lg {
    padding: 1rem 2.5rem;
    font-size: var(--font-size-lg);
  }

  /* Variants */
  .btn-primary {
    background-color: var(--color-brand-primary);
    color: var(--color-text-inverse);
  }

  .btn-primary:hover:not(:disabled) {
    background-color: var(--color-brand-primary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .btn-primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-secondary {
    background-color: var(--color-gray-600);
    color: var(--color-text-inverse);
  }

  .btn-secondary:hover:not(:disabled) {
    background-color: var(--color-gray-700);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .btn-secondary:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-success {
    background-color: var(--color-success);
    color: var(--color-text-inverse);
  }

  .btn-success:hover:not(:disabled) {
    background-color: var(--color-success-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .btn-success:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-danger {
    background-color: var(--color-danger);
    color: var(--color-text-inverse);
  }

  .btn-danger:hover:not(:disabled) {
    background-color: var(--color-danger-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .btn-danger:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-info {
    background-color: var(--color-info);
    color: var(--color-text-inverse);
  }

  .btn-info:hover:not(:disabled) {
    background-color: var(--color-info-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .btn-info:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-ghost {
    background-color: transparent;
    color: var(--color-text-primary);
    border: 1px solid var(--color-border-primary);
  }

  .btn-ghost:hover:not(:disabled) {
    background-color: var(--color-gray-50);
    border-color: var(--color-border-secondary);
  }

  /* Full width */
  .btn-full-width {
    width: 100%;
  }
</style>
