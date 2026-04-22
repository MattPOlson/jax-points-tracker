<script>
  import { onMount } from 'svelte';
  import { Bell, BellOff } from 'lucide-svelte';
  import toast from 'svelte-french-toast';
  import { user } from '$lib/stores/user';
  import { supabase } from '$lib/supabaseClient';

  let subscribed = false;
  let supported = false;
  let currentSubscription = null;

  const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

  onMount(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    supported = true;

    try {
      const reg = await navigator.serviceWorker.ready;
      currentSubscription = await reg.pushManager.getSubscription();
      subscribed = !!currentSubscription;
    } catch (err) {
      console.error('Error checking push subscription:', err);
    }
  });

  async function toggle() {
    if (!supported) {
      toast.error('Push notifications are not supported in this browser.');
      return;
    }

    if (Notification.permission === 'denied') {
      toast.error('Notifications are blocked. Please enable them in your browser settings.');
      return;
    }

    if (subscribed && currentSubscription) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  }

  async function subscribe() {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Notification permission denied.');
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ subscription })
      });

      if (!response.ok) throw new Error('Failed to save subscription');

      currentSubscription = subscription;
      subscribed = true;
      toast.success('Notifications enabled!');
    } catch (err) {
      console.error('Subscribe error:', err);
      toast.error('Failed to enable notifications.');
    }
  }

  async function unsubscribe() {
    try {
      const endpoint = currentSubscription.endpoint;
      await currentSubscription.unsubscribe();

      const { data: { session } } = await supabase.auth.getSession();
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ endpoint })
      });

      currentSubscription = null;
      subscribed = false;
      toast.success('Notifications disabled.');
    } catch (err) {
      console.error('Unsubscribe error:', err);
      toast.error('Failed to disable notifications.');
    }
  }

  /** @param {string} base64String */
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  }
</script>

{#if supported}
  <button
    class="nav-button bell-btn"
    class:active={subscribed}
    on:click={toggle}
    title={subscribed ? 'Notifications enabled — click to disable' : 'Enable push notifications'}
    aria-label={subscribed ? 'Disable push notifications' : 'Enable push notifications'}
  >
    {#if subscribed}
      <Bell size={20} />
    {:else}
      <BellOff size={20} />
    {/if}
  </button>
{/if}

<style>
  .nav-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-button);
    width: 40px;
    height: 40px;
    transition: all 0.2s ease;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.85);
    flex-shrink: 0;
  }

  .nav-button:hover {
    background: rgba(255, 255, 255, 0.22);
    border-color: rgba(255, 255, 255, 0.35);
    color: white;
  }

  .nav-button.active {
    background: rgba(255, 200, 0, 0.2);
    border-color: rgba(255, 200, 0, 0.5);
    color: #fcd34d;
  }

  .nav-button.active:hover {
    background: rgba(255, 200, 0, 0.3);
  }

  @media (max-width: 480px) {
    .nav-button {
      width: 36px;
      height: 36px;
    }
  }
</style>
