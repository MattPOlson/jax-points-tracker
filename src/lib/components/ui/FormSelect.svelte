<script>
  /**
   * FormSelect Component
   *
   * A styled select dropdown with label, error message, and helper text support.
   *
   * @prop {string} id - Select ID (also used for label 'for' attribute)
   * @prop {string} label - Label text
   * @prop {string} value - Selected value
   * @prop {Array} options - Array of {value, label} objects for options
   * @prop {boolean} required - Whether the select is required
   * @prop {boolean} disabled - Whether the select is disabled
   * @prop {string} error - Error message to display
   * @prop {string} helper - Helper text to display
   * @prop {string} placeholder - Placeholder option text
   * @prop {boolean} fullWidth - Whether select should take full width (default: true)
   */

  export let id;
  export let label;
  export let value = '';
  export let options = [];
  export let required = false;
  export let disabled = false;
  export let error = '';
  export let helper = '';
  export let placeholder = 'Select an option';
  export let fullWidth = true;
</script>

<div class="form-select-wrapper" class:full-width={fullWidth}>
  {#if label}
    <label for={id} class="form-label" class:form-label-required={required}>
      {label}
    </label>
  {/if}
  <select
    {id}
    {required}
    {disabled}
    bind:value
    class="form-select"
    class:form-select-error={error}
    on:change
    on:blur
    on:focus
  >
    {#if placeholder}
      <option value="" disabled>{placeholder}</option>
    {/if}
    {#each options as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
  {#if error}
    <p class="form-error">{error}</p>
  {:else if helper}
    <p class="form-helper">{helper}</p>
  {/if}
</div>

<style>
  .form-select-wrapper {
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

  .form-select {
    padding: var(--space-3);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
    background-color: var(--color-bg-primary);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    width: 100%;
    cursor: pointer;
  }

  .form-select:focus {
    outline: none;
    border-color: var(--color-border-focus);
    box-shadow: 0 0 0 3px var(--color-brand-primary-light);
  }

  .form-select:disabled {
    background-color: var(--color-bg-tertiary);
    color: var(--color-text-disabled);
    cursor: not-allowed;
  }

  .form-select-error {
    border-color: var(--color-danger);
  }

  .form-select-error:focus {
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
