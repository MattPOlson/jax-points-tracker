<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { Auth } from '@supabase/auth-ui-svelte';
  import { ThemeSupa } from '@supabase/auth-ui-shared';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/user';
  import { page } from '$app/stores';

  import { isLoaded as categoriesLoaded } from '$lib/stores/categoryStore'; // optional if needed post-login
  import { isLoaded as approvalsLoaded } from '$lib/stores/approvalsStore'; // optional

  import { loadApprovals } from '$lib/stores/approvalsStore';
  import { loadCategoryData } from '$lib/stores/categoryStore';
  import { loadLeaderboard } from '$lib/stores/leaderboardStore';
  import { loadMySubmissions } from '$lib/stores/mySubmissionsStore';


  let subscription;
  let splash = false;
  let splashTimeout;

  $: if ($page.url.pathname === '/' && $user?.id) {
  loadApprovals(true);
  loadCategoryData(true);
  loadleaderboardData(true);
  loadMySubmissions(true);
  }


  function startSplash() {
    splash = true;
    splashTimeout = setTimeout(() => {
      splash = false;
    }, 10000);
  }

  // Dismiss splash early if user + data is ready
  $: if ($user?.id && splash) {
    const ready = $categoriesLoaded ?? true; // customize this check with real flags
    if (ready) {
      clearTimeout(splashTimeout);
      splash = false;
    }
  }

  onMount(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        user.set(session.user);
        startSplash(); // show splash when redirected
        goto('/');
      }
    });

    subscription = data.subscription;

    return () => {
      if (subscription) subscription.unsubscribe();
      clearTimeout(splashTimeout);
    };
  });
</script>

{#if splash}
  <div class="splash-screen">
    <p>Loading your dashboard...</p>
  </div>
{:else if !$user}
  <div class="auth-wrapper">
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa }}
      providers={[]}
    />
  </div>
{/if}

<div class="auth-wrapper">
  <Auth
    supabaseClient={supabase}
    appearance={{ theme: ThemeSupa }}
    providers={[]}
  />
</div>

<style>
  .auth-wrapper {
    max-width: 400px;
    margin: 2rem auto;
    padding: 2rem;
  }

  :global(.supabase-auth-ui_ui-container) {
    width: 100%;
  }

  :global(.supabase-auth-ui_ui-input) {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  :global(.supabase-auth-ui_ui-button) {
    width: 100%;
    padding: 0.75rem;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  :global(.supabase-auth-ui_ui-button:hover) {
    background-color: #388e3c;
  }

  :global(.supabase-auth-ui_ui-label) {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  :global(.supabase-auth-ui_ui-message) {
    margin: 1rem 0;
    padding: 0.5rem;
    border-radius: 4px;
  }

  :global(.supabase-auth-ui_ui-message.error) {
    background-color: #ffebee;
    color: #c62828;
  }

  .splash-screen {
  text-align: center;
  margin-top: 6rem;
  font-size: 1.25rem;
  color: #666;
}
</style>
