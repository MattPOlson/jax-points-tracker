<script>
  /**
   * FormInput Component
   *
   * A styled input field with label, error message, and helper text support.
   *
   * @prop {string} id - Input ID (also used for label 'for' attribute)
   * @prop {string} label - Label text
   * @prop {string} type - Input type (text, email, password, number, tel, date, etc.)
   * @prop {string} value - Input value
   * @prop {string} placeholder - Placeholder text
   * @prop {boolean} required - Whether the input is required
   * @prop {boolean} disabled - Whether the input is disabled
   * @prop {string} error - Error message to display
   * @prop {string} helper - Helper text to display
   * @prop {boolean} fullWidth - Whether input should take full width (default: true)
   */

  export let id;
  export let label;
  export let type = 'text';
  export let value = '';
  export let placeholder = '';
  export let required = false;
  export let disabled = false;
  export let error = '';
  export let helper = '';
  export let fullWidth = true;
</script>

<div class="form-input-wrapper" class:full-width={fullWidth}>
  {#if label}
    <label for={id} class="form-label" class:form-label-required={required}>
      {label}
    </label>
  {/if}
  <input
    {id}
    type={type}
    {placeholder}
    {required}
    {disabled}
    value={value}
    class="form-input"
    class:form-input-error={error}
    on:input={(e) => value = e.target.value}
    on:change
    on:blur
    on:focus
  />
  {#if error}
    <p class="form-error">{error}</p>
  {:else if helper}
    <p class="form-helper">{helper}</p>
  {/if}
</div>

<style>
  .form-input-wrapper {
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

  .form-input {
    padding: var(--space-3);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
    background-color: var(--color-bg-primary);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    width: 100%;
  }

  .form-input:focus {
    outline: none;
    border-color: var(--color-border-focus);
    box-shadow: 0 0 0 3px var(--color-brand-primary-light);
  }

  .form-input:disabled {
    background-color: var(--color-bg-tertiary);
    color: var(--color-text-disabled);
    cursor: not-allowed;
  }

  .form-input-error {
    border-color: var(--color-danger);
  }

  .form-input-error:focus {
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
