<script>
  import { confirmState } from '$lib/stores/confirmDialog.js';

  function answer(result) {
    const { resolve } = $confirmState;
    confirmState.set({ open: false, title: '', message: '', resolve: null });
    if (resolve) resolve(result);
  }

  function handleKeydown(e) {
    if (!$confirmState.open) return;
    if (e.key === 'Escape') answer(false);
    if (e.key === 'Enter') answer(true);
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if $confirmState.open}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="backdrop" on:click={() => answer(false)}>
    <div
      class="dialog"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
      on:click|stopPropagation
    >
      <div class="dialog-header">
        <h2 id="confirm-title" class="dialog-title">{$confirmState.title}</h2>
      </div>
      <div class="dialog-body">
        <p id="confirm-message" class="dialog-message">{$confirmState.message}</p>
      </div>
      <div class="dialog-footer">
        <button class="btn btn-cancel" on:click={() => answer(false)}>Cancel</button>
        <button class="btn btn-confirm" on:click={() => answer(true)}>Confirm</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-4);
    z-index: 10000;
    animation: fadeIn 0.15s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .dialog {
    background: var(--color-bg-primary, #fff);
    border-radius: var(--radius-lg, 10px);
    border-top: 3px solid var(--color-brand-gold, #c9a227);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 420px;
    animation: slideUp 0.15s ease;
  }

  @keyframes slideUp {
    from { transform: translateY(16px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  .dialog-header {
    padding: var(--space-5) var(--space-6) var(--space-2);
  }

  .dialog-title {
    font-family: var(--font-family-display, 'Oswald', sans-serif);
    font-size: var(--font-size-lg, 1.125rem);
    font-weight: 600;
    color: var(--color-text-primary, #1e3a5f);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .dialog-body {
    padding: var(--space-3) var(--space-6) var(--space-5);
  }

  .dialog-message {
    font-size: var(--font-size-base, 1rem);
    color: var(--color-text-secondary, #4a5568);
    line-height: 1.5;
    margin: 0;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-6);
    border-top: 1px solid var(--color-border-primary, #e2e8f0);
  }

  .btn {
    padding: var(--space-2) var(--space-5);
    border-radius: var(--radius-button, 6px);
    font-family: var(--font-family-display, 'Oswald', sans-serif);
    font-size: var(--font-size-sm, 0.875rem);
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .btn-cancel {
    background: var(--color-bg-secondary, #f5f2ec);
    color: var(--color-text-secondary, #4a5568);
    border: 1px solid var(--color-border-primary, #e2e8f0);
  }

  .btn-cancel:hover {
    background: var(--color-bg-tertiary, #ece9e1);
  }

  .btn-confirm {
    background: var(--color-brand-primary, #1e3a5f);
    color: #fff;
  }

  .btn-confirm:hover {
    background: var(--color-brand-primary-dark, #162c4a);
  }
</style>
