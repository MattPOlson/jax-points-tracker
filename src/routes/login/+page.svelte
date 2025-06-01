<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { Auth } from '@supabase/auth-ui-svelte';
  import { ThemeSupa } from '@supabase/auth-ui-shared';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/user';

  let subscription;

  onMount(() => {
    // Listen for exactly “SIGNED_IN” so we can redirect as soon as login completes
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        user.set(session.user);
        goto('/'); // immediately redirect to home
      }
    });
    subscription = data.subscription;

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  });
</script>

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
</style>
