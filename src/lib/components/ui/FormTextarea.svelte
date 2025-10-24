<script>
  /**
   * FormTextarea Component
   *
   * A styled textarea with label, error message, and helper text support.
   *
   * @prop {string} id - Textarea ID (also used for label 'for' attribute)
   * @prop {string} label - Label text
   * @prop {string} value - Textarea value
   * @prop {string} placeholder - Placeholder text
   * @prop {number} rows - Number of visible rows (default: 4)
   * @prop {boolean} required - Whether the textarea is required
   * @prop {boolean} disabled - Whether the textarea is disabled
   * @prop {string} error - Error message to display
   * @prop {string} helper - Helper text to display
   * @prop {boolean} fullWidth - Whether textarea should take full width (default: true)
   */

  export let id;
  export let label;
  export let value = '';
  export let placeholder = '';
  export let rows = 4;
  export let required = false;
  export let disabled = false;
  export let error = '';
  export let helper = '';
  export let fullWidth = true;
</script>

<div class="form-textarea-wrapper" class:full-width={fullWidth}>
  {#if label}
    <label for={id} class="form-label" class:form-label-required={required}>
      {label}
    </label>
  {/if}
  <textarea
    {id}
    {placeholder}
    {rows}
    {required}
    {disabled}
    bind:value
    class="form-textarea"
    class:form-textarea-error={error}
    on:input
    on:change
    on:blur
    on:focus
  ></textarea>
  {#if error}
    <p class="form-error">{error}</p>
  {:else if helper}
    <p class="form-helper">{helper}</p>
  {/if}
</div>

<style>
  .form-textarea-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .full-width {
    width: 100%;
  }

  .form-label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }

  .form-label-required::after {
    content: ' *';
    color: var(--color-danger);
  }

  .form-textarea {
    padding: var(--space-3);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
    background-color: var(--color-bg-primary);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    width: 100%;
    resize: vertical;
    min-height: 100px;
  }

  .form-textarea:focus {
    outline: none;
    border-color: var(--color-border-focus);
    box-shadow: 0 0 0 3px var(--color-brand-primary-light);
  }

  .form-textarea:disabled {
    background-color: var(--color-bg-tertiary);
    color: var(--color-text-disabled);
    cursor: not-allowed;
    resize: none;
  }

  .form-textarea-error {
    border-color: var(--color-danger);
  }

  .form-textarea-error:focus {
    border-color: var(--color-danger);
    box-shadow: 0 0 0 3px var(--color-danger-light);
  }

  .form-error {
    font-size: var(--font-size-sm);
    color: var(--color-danger);
    margin: 0;
  }

  .form-helper {
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
    margin: 0;
  }
</style>
