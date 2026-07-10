<script>
  import { onMount } from 'svelte';
  import { Bell } from 'lucide-svelte';
  import { takePendingNotification } from '$lib/utils/pendingNotification.js';

  /**
   * In-app display of a tapped push notification (#130). Two handoff
   * channels from the service worker, checked in order:
   * 1. ?pn=1&pn_title=&pn_body= query params (warm windows, manual tests)
   * 2. IndexedDB fallback -- when the OS launches a fully-closed PWA the
   *    launch flow can drop the query params, so the SW also parks the
   *    content there.
   * Mounted by the root layout ABOVE the logged-out landing gate so the
   * message shows even before the session restores.
   */
  let open = false;
  let title = '';
  let body = '';

  // A parked record older than this is from a launch that never finished --
  // don't pop it up days later.
  const PENDING_MAX_AGE_MS = 5 * 60 * 1000;

  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('pn') === '1') {
      // Cap at the server-side send limits; anything longer is not ours.
      title = (params.get('pn_title') || '').slice(0, 100);
      body = (params.get('pn_body') || '').slice(0, 200);
      stripParams();
      // Consume the IDB copy too so it can't re-show on the next launch.
      takePendingNotification(0).catch(() => {});
      if (title || body) open = true;
      return;
    }

    // Cold-start fallback: no params made it through -- check IndexedDB.
    try {
      const pending = await takePendingNotification(PENDING_MAX_AGE_MS);
      if (pending) {
        title = (pending.title || '').slice(0, 100);
        body = (pending.body || '').slice(0, 200);
        if (title || body) open = true;
      }
    } catch {
      // No IDB (private mode, ancient browser) -- nothing to show.
    }
  });

  // Remove the pn_* params so refresh/back-forward doesn't re-show the popup.
  function stripParams() {
    const url = new URL(window.location.href);
    for (const key of ['pn', 'pn_title', 'pn_body']) {
      url.searchParams.delete(key);
    }
    history.replaceState(null, '', url.pathname + url.search + url.hash);
  }

  function dismiss() {
    open = false;
  }

  function handleKeydown(e) {
    if (!open) return;
    if (e.key === 'Escape' || e.key === 'Enter') dismiss();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <div
    class="backdrop"
    role="presentation"
    on:click={(e) => e.target === e.currentTarget && dismiss()}
    on:keydown={handleKeydown}
  >
    <div
      class="dialog"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="pn-title"
      aria-describedby="pn-message"
    >
      <div class="dialog-header">
        <span class="dialog-icon">
          <Bell size={20} strokeWidth={2} />
        </span>
        <h2 id="pn-title" class="dialog-title">{title || 'Notification'}</h2>
      </div>
      {#if body}
        <div class="dialog-body">
          <p id="pn-message" class="dialog-message">{body}</p>
        </div>
      {/if}
      <div class="dialog-footer">
        <button class="btn btn-ok" on:click={dismiss}>OK</button>
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
    background: var(--color-bg-primary);
    border-radius: var(--radius-lg, 10px);
    border-top: 3px solid var(--color-brand-gold);
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
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-5) var(--space-6) var(--space-2);
  }

  .dialog-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--color-brand-primary);
    color: var(--color-brand-gold);
    flex-shrink: 0;
  }

  .dialog-title {
    font-family: var(--font-family-display, 'Oswald', sans-serif);
    font-size: var(--font-size-lg, 1.125rem);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
    overflow-wrap: anywhere;
  }

  .dialog-body {
    padding: var(--space-3) var(--space-6) var(--space-5);
  }

  .dialog-message {
    font-size: var(--font-size-base, 1rem);
    color: var(--color-text-secondary);
    line-height: 1.5;
    margin: 0;
    overflow-wrap: anywhere;
    white-space: pre-line;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    padding: var(--space-4) var(--space-6);
    border-top: 1px solid var(--color-border-primary, var(--color-gray-200));
  }

  .btn-ok {
    padding: var(--space-2) var(--space-6);
    border-radius: var(--radius-button, 6px);
    font-family: var(--font-family-display, 'Oswald', sans-serif);
    font-size: var(--font-size-sm, 0.875rem);
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    background: var(--color-brand-primary);
    color: var(--color-white);
  }

  .btn-ok:hover {
    background: var(--color-brand-primary-dark, var(--color-brand-primary-hover));
  }
</style>
