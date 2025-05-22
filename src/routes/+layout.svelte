<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { user } from '$lib/stores/user';
  import { Toaster } from 'svelte-french-toast';

  onMount(() => {
    /** @type {import('@supabase/supabase-js').Subscription | undefined} */
    let subscription;

    (async () => {
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((event, session) => {
        user.set(session?.user ?? null);
      });

      // Set initial user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      user.set(currentUser);

      subscription = sub;
    })();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  });
</script>

<div class="topbar">
  {#if $user}
    <div class="login-icon logged-in" title="You are logged in">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="black" stroke-width="2">
        <circle cx="20" cy="14" r="8" />
        <path d="M6 34c0-6 8-10 14-10s14 4 14 10" />
      </svg>
    </div>
  {:else}
    <a href="/login" aria-label="Login" class="login-icon">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="black" stroke-width="2">
        <circle cx="20" cy="14" r="8" />
        <path d="M6 34c0-6 8-10 14-10s14 4 14 10" />
      </svg>
    </a>
  {/if}
</div>

<Toaster />
<slot />

<style>
.topbar {
  position: fixed;
  top: 1rem;
  right: 1.5rem;
  z-index: 100;
}
.login-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: box-shadow 0.2s, background 0.2s;
  cursor: pointer;
}
.login-icon:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  background: #f0f0f0;
}
.login-icon.logged-in {
  background: #4caf50;
  cursor: default;
  pointer-events: none;
}
</style>