<script>
  import { onMount } from 'svelte';
  import { Download, X, Share } from 'lucide-svelte';

  let show = false;
  let deferredPrompt = null;
  let isIOS = false;

  const STORAGE_KEY = 'jax-install-dismissed-until';

  onMount(() => {
    if (typeof window === 'undefined') return;

    // Already installed as standalone app — nothing to do
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) return;

    // Respect prior dismissal (suppressed for 30 days)
    const suppressedUntil = localStorage.getItem(STORAGE_KEY);
    if (suppressedUntil && Date.now() < Number(suppressedUntil)) return;

    // iOS Safari — no beforeinstallprompt, must show manual instructions
    isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !('MSStream' in window) &&
      navigator.userAgent.includes('Safari') &&
      !navigator.userAgent.includes('Chrome');

    if (isIOS) {
      // Show after a brief delay so the page has settled
      setTimeout(() => { show = true; }, 2500);
      return;
    }

    // Android Chrome / Edge — capture the install event
    const handler = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      show = true;
    };
    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      show = false;
      deferredPrompt = null;
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  });

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    show = false;
    // Whether accepted or dismissed, don't bother again for 30 days
    dismiss();
  }

  function dismiss() {
    show = false;
    const thirtyDays = Date.now() + 30 * 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, String(thirtyDays));
  }
</script>

{#if show}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="install-banner" role="dialog" aria-label="Install JAX Portal app">
    <div class="banner-content">
      <div class="banner-icon">
        <img src="/icons/icon-192.png" alt="JAX Portal" />
      </div>

      <div class="banner-text">
        <div class="banner-title">Install JAX Portal</div>
        {#if isIOS}
          <div class="banner-subtitle">
            Tap <Share size={13} class="inline-icon" /> then
            <strong>"Add to Home Screen"</strong>
          </div>
        {:else}
          <div class="banner-subtitle">Add to your home screen for quick access</div>
        {/if}
      </div>

      <div class="banner-actions">
        {#if !isIOS}
          <button class="btn-install" on:click={install}>
            <Download size={16} />
            Install
          </button>
        {/if}
        <button class="btn-dismiss" on:click={dismiss} aria-label="Dismiss install prompt">
          <X size={18} />
        </button>
      </div>
    </div>

    {#if isIOS}
      <!-- Arrow pointing down to the Safari share button -->
      <div class="ios-arrow">▼</div>
    {/if}
  </div>
{/if}

<style>
  .install-banner {
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 2rem);
    max-width: 480px;
    background: var(--color-brand-primary);
    border: 1px solid rgba(201, 162, 39, 0.4);
    border-top: 3px solid var(--color-brand-gold);
    border-radius: var(--radius-card);
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.35);
    z-index: 9999;
    animation: slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  .banner-content {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 0.875rem 1rem;
  }

  .banner-icon {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .banner-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .banner-text {
    flex: 1;
    min-width: 0;
  }

  .banner-title {
    font-family: var(--font-family-display);
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: white;
    line-height: 1.2;
    margin-bottom: 0.2rem;
  }

  .banner-subtitle {
    font-size: 0.78rem;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.4;
    display: flex;
    align-items: center;
    gap: 0.2rem;
    flex-wrap: wrap;
  }

  .banner-subtitle strong {
    color: var(--color-brand-gold);
  }

  .banner-subtitle :global(.inline-icon) {
    display: inline;
    vertical-align: middle;
    color: var(--color-brand-gold);
  }

  .banner-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .btn-install {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    background: var(--color-brand-gold);
    color: var(--color-brand-primary);
    border: none;
    border-radius: var(--radius-button);
    padding: 0.5rem 0.875rem;
    font-family: var(--font-family-display);
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .btn-install:hover {
    background: var(--color-brand-gold-hover, #b08b1a);
    transform: translateY(-1px);
  }

  .btn-dismiss {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-button);
    width: 32px;
    height: 32px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .btn-dismiss:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .ios-arrow {
    text-align: center;
    font-size: 1.25rem;
    color: var(--color-brand-gold);
    padding: 0 1rem 0.5rem;
    animation: bounce 1.5s ease-in-out infinite;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(4px); }
  }

  @media (max-width: 400px) {
    .banner-title {
      font-size: 0.875rem;
    }

    .btn-install {
      padding: 0.45rem 0.7rem;
      font-size: 0.75rem;
    }
  }
</style>
