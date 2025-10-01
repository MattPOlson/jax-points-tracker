<script>
  /**
   * Modal Component
   *
   * A dialog/modal overlay component.
   *
   * @prop {boolean} open - Whether the modal is open
   * @prop {string} title - Modal title
   * @prop {string} size - Modal size: 'sm', 'md', 'lg', 'xl'
   * @prop {Function} onClose - Callback function when modal closes
   */

  export let open = false;
  export let title = '';
  export let size = 'md';
  export let onClose = () => {};

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Escape' && open) {
      onClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <div class="modal-backdrop" on:click={handleBackdropClick}>
    <div class="modal modal-{size}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-header">
        {#if title}
          <h2 id="modal-title" class="modal-title">{title}</h2>
        {/if}
        <button class="modal-close" on:click={onClose} aria-label="Close modal">
          ✕
        </button>
      </div>
      <div class="modal-body">
        <slot />
      </div>
      {#if $$slots.footer}
        <div class="modal-footer">
          <slot name="footer" />
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-4);
    z-index: var(--z-modal-backdrop);
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal {
    background-color: var(--color-bg-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-2xl);
    max-height: 90vh;
    overflow-y: auto;
    z-index: var(--z-modal);
    animation: slideUp 0.2s ease;
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* Modal sizes */
  .modal-sm {
    width: 100%;
    max-width: 400px;
  }

  .modal-md {
    width: 100%;
    max-width: 600px;
  }

  .modal-lg {
    width: 100%;
    max-width: 800px;
  }

  .modal-xl {
    width: 100%;
    max-width: 1200px;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-6);
    border-bottom: 1px solid var(--color-border-primary);
  }

  .modal-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0;
  }

  .modal-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--font-size-xl);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .modal-close:hover {
    background-color: var(--color-gray-100);
    color: var(--color-text-primary);
  }

  .modal-body {
    padding: var(--space-6);
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-3);
    padding: var(--space-6);
    border-top: 1px solid var(--color-border-primary);
  }

  /* Responsive */
  @media (max-width: 640px) {
    .modal-backdrop {
      padding: 0;
    }

    .modal {
      max-height: 100vh;
      border-radius: 0;
    }

    .modal-sm,
    .modal-md,
    .modal-lg,
    .modal-xl {
      width: 100%;
      max-width: 100%;
    }
  }
</style>
